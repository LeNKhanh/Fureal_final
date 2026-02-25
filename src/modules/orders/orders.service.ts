import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from '../order-items/entities/order-item.entity';
import { Cart } from '../carts/entities/cart.entity';
import { Product } from '../products/entities/product.entity';
import { OrderStatusHistory } from '../order-status-history/entities/order-status-history.entity';
import { InventoryLog } from '../inventory-logs/entities/inventory-log.entity';
import { Address } from '../addresses/entities/address.entity';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { FilterOrderDto } from './dto/filter-order.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(OrderStatusHistory)
    private orderStatusHistoryRepository: Repository<OrderStatusHistory>,
    @InjectRepository(InventoryLog)
    private inventoryLogRepository: Repository<InventoryLog>,
    @InjectRepository(Address)
    private addressRepository: Repository<Address>,
    private auditLogsService: AuditLogsService,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    if (!userId) {
      throw new ForbiddenException('You must be logged in to create an order');
    }

    // Get user's cart
    const cart = await this.cartRepository.findOne({
      where: { userId },
      relations: ['items', 'items.product'],
    });

    // Get address if provided
    let addressSnapshot = null;
    let receiverName = null;
    let receiverPhone = null;

    if (createOrderDto.addressId) {
      // Use saved address by ID
      const address = await this.addressRepository.findOne({
        where: { id: createOrderDto.addressId, userId },
      });

      if (!address) {
        throw new NotFoundException('Address not found');
      }

      addressSnapshot = `${address.address}, ${address.city}`;
      receiverName = address.receiverName;
      receiverPhone = address.phone;
    } else if (createOrderDto.receiverName && createOrderDto.phone && createOrderDto.address) {
      // Use inline address fields from form
      const city = createOrderDto.city ? `, ${createOrderDto.city}` : '';
      addressSnapshot = `${createOrderDto.address}${city}`;
      receiverName = createOrderDto.receiverName;
      receiverPhone = createOrderDto.phone;
    }

    // Use transaction for order creation
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate stock and calculate total
      let totalAmount = 0;
      for (const item of cart.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: item.productId },
        });

        if (!product || !product.isActive) {
          throw new BadRequestException(`Product ${item.productId} is not available`);
        }

        if (product.stock < item.quantity) {
          throw new BadRequestException(`Insufficient stock for product ${product.name}`);
        }

        totalAmount += Number(product.price) * item.quantity;
      }

      // Create order
      const order = queryRunner.manager.create(Order, {
        userId,
        totalAmount,
        status: 'PENDING',
        shippingAddress: addressSnapshot,
        receiverName,
        receiverPhone,
        paymentMethod: createOrderDto.paymentMethod || 'COD',
        notes: createOrderDto.notes || null,
      });

      const savedOrder = await queryRunner.manager.save(order);

      // Create order items, update stock, and create inventory logs
      for (const cartItem of cart.items) {
        const product = await queryRunner.manager.findOne(Product, {
          where: { id: cartItem.productId },
          relations: ['images'],
        });

        // Build product size string
        const sizeString = product.width && product.height && product.depth
          ? `W${product.width}xH${product.height}xD${product.depth}cm`
          : null;

        // Get first product image URL
        const imageUrl = product.images && product.images.length > 0
          ? product.images[0].imageUrl
          : null;

        // Create order item with product snapshot
        const orderItem = queryRunner.manager.create(OrderItem, {
          orderId: savedOrder.id,
          productId: cartItem.productId,
          price: product.price,
          quantity: cartItem.quantity,
          // Product snapshot at time of order
          productName: product.name,
          productBrand: product.brand,
          productColor: product.color,
          productSize: sizeString,
          productMaterial: product.material,
          productImageUrl: imageUrl,
        });
        await queryRunner.manager.save(orderItem);

        // Update stock
        product.stock -= cartItem.quantity;
        await queryRunner.manager.save(product);

        // Create inventory log
        const inventoryLog = queryRunner.manager.create(InventoryLog, {
          productId: product.id,
          changeQuantity: -cartItem.quantity,
          reason: `ORDER: ${savedOrder.id}`,
          changedById: userId,
        });
        await queryRunner.manager.save(inventoryLog);
      }

      // Clear cart items
      await queryRunner.manager
        .createQueryBuilder()
        .delete()
        .from('cart_items')
        .where('cart_id = :cartId', { cartId: cart.id })
        .execute();

      // Create status history
      const statusHistory = queryRunner.manager.create(OrderStatusHistory, {
        orderId: savedOrder.id,
        oldStatus: null,
        newStatus: 'PENDING',
      });
      await queryRunner.manager.save(statusHistory);

      // Commit transaction
      await queryRunner.commitTransaction();

      // Log audit (outside transaction)
      await this.auditLogsService.log(
        userId,
        'CREATE_ORDER',
        `Order ID: ${savedOrder.id}, Total: ${totalAmount}`,
      );

      return this.findOne(savedOrder.id, userId);
    } catch (error) {
      // Rollback transaction on error
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(
    filterDto: FilterOrderDto,
    userId?: string,
    roleName?: string,
  ): Promise<PaginatedResult<Order>> {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      userId: filterUserId,
      sortBy = 'createdAt',
      sortOrder = 'DESC'
    } = filterDto;
    
    const skip = (page - 1) * limit;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.user', 'user');

    if (roleName === 'USER') {
      queryBuilder.where('order.userId = :userId', { userId });
    } else if (filterUserId) {
      queryBuilder.where('order.userId = :filterUserId', { filterUserId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    queryBuilder
      .orderBy(`order.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [data, totalItems] = await queryBuilder.getManyAndCount();
    const totalPages = Math.ceil(totalItems / limit);

    return {
      data,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async findOne(id: string, userId?: string, roleName?: string): Promise<Order> {
    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('items.product', 'product')
      .leftJoinAndSelect('order.user', 'user')
      .leftJoinAndSelect('order.statusHistory', 'statusHistory')
      .where('order.id = :id', { id });

    const order = await queryBuilder.getOne();

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Users can only see their own orders
    if (roleName === 'USER' && order.userId !== userId) {
      throw new ForbiddenException('You can only view your own orders');
    }

    return order;
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    const oldStatus = order.status;
    order.status = updateStatusDto.status;
    await this.orderRepository.save(order);

    // Create status history
    await this.createStatusHistory(id, oldStatus, updateStatusDto.status);

    // Log audit
    await this.auditLogsService.log(
      null,
      'UPDATE_ORDER_STATUS',
      `Order ID: ${id}, ${oldStatus} -> ${updateStatusDto.status}`,
    );

    return this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'statusHistory'],
    });
  }

  async cancelOrder(id: string, userId: string, reason?: string): Promise<Order> {
    const order = await this.orderRepository.findOne({ where: { id } });

    if (!order) {
      throw new NotFoundException(`Order with ID ${id} not found`);
    }

    // Only the order owner can cancel
    if (order.userId !== userId) {
      throw new ForbiddenException('You can only cancel your own orders');
    }

    // Only cancellable when not yet shipped/delivered/already cancelled
    const cancellableStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING'];
    if (!cancellableStatuses.includes(order.status)) {
      throw new BadRequestException(
        `Cannot cancel order with status "${order.status}". Only orders in PENDING, CONFIRMED or PROCESSING status can be cancelled.`,
      );
    }

    const oldStatus = order.status;
    order.status = 'CANCELLED';
    await this.orderRepository.save(order);

    // Record status history
    await this.createStatusHistory(id, oldStatus, 'CANCELLED');

    // Audit log
    await this.auditLogsService.log(
      userId,
      'CANCEL_ORDER',
      `Order ID: ${id}, ${oldStatus} -> CANCELLED${reason ? ` | Reason: ${reason}` : ''}`,
    );

    return this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'items.product', 'statusHistory'],
    });
  }

  private async createStatusHistory(
    orderId: string,
    oldStatus: string,
    newStatus: string,
  ): Promise<void> {
    const history = this.orderStatusHistoryRepository.create({
      orderId,
      oldStatus,
      newStatus,
    });
    await this.orderStatusHistoryRepository.save(history);
  }
}

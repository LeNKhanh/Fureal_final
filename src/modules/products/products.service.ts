import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { FilterProductDto } from './dto/filter-product.dto';
import { PaginatedResult } from '../../common/dto/pagination.dto';
import { AuditLogsService } from '../audit-logs/audit-logs.service';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    private auditLogsService: AuditLogsService,
  ) {}

  async create(createDto: CreateProductDto, userId: string): Promise<Product> {
    const product = this.productRepository.create({
      ...createDto,
      createdById: userId,
    });
    const savedProduct = await this.productRepository.save(product);

    await this.auditLogsService.log(
      userId,
      'CREATE_PRODUCT',
      `Product: ${savedProduct.name} (ID: ${savedProduct.id})`,
    );

    return savedProduct;
  }

  async findAll(filterDto: FilterProductDto): Promise<PaginatedResult<Product>> {
    const { 
      page = 1, 
      limit = 20, 
      search, 
      categoryId, 
      minPrice, 
      maxPrice, 
      isActive, 
      sortBy = 'createdAt', 
      sortOrder = 'DESC',
      inStock,
      brand,
      color,
      space,
      menh,
      huong
    } = filterDto;
    
    const skip = (page - 1) * limit;

    const queryBuilder = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.category', 'category')
      .leftJoinAndSelect('product.images', 'images');

    if (search) {
      queryBuilder.andWhere('product.name LIKE :search OR product.description LIKE :search', { 
        search: `%${search}%` 
      });
    }

    if (categoryId) {
      queryBuilder.andWhere('product.categoryId = :categoryId', { categoryId });
    }

    if (minPrice !== undefined && maxPrice !== undefined) {
      queryBuilder.andWhere('product.price BETWEEN :minPrice AND :maxPrice', { minPrice, maxPrice });
    } else if (minPrice !== undefined) {
      queryBuilder.andWhere('product.price >= :minPrice', { minPrice });
    } else if (maxPrice !== undefined) {
      queryBuilder.andWhere('product.price <= :maxPrice', { maxPrice });
    }

    if (isActive !== undefined) {
      queryBuilder.andWhere('product.isActive = :isActive', { isActive });
    }

    if (inStock) {
      queryBuilder.andWhere('product.stock > 0');
    }

    if (brand) {
      queryBuilder.andWhere('product.brand = :brand', { brand });
    }

    if (color) {
      queryBuilder.andWhere('product.color = :color', { color });
    }

    if (space) {
      queryBuilder.andWhere('product.space = :space', { space });
    }

    if (menh) {
      queryBuilder.andWhere('product.menh LIKE :menh', { menh: `%${menh}%` });
    }

    if (huong) {
      queryBuilder.andWhere('product.huong LIKE :huong', { huong: `%${huong}%` });
    }

    queryBuilder
      .orderBy(`product.${sortBy}`, sortOrder)
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

  async findOne(id: string): Promise<Product> {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: ['category', 'images', 'createdBy'],
    });

    if (!product) {
      throw new NotFoundException(`Product with ID ${id} not found`);
    }

    return product;
  }

  async update(id: string, updateDto: UpdateProductDto): Promise<Product> {
    const product = await this.findOne(id);
    Object.assign(product, updateDto);
    const updatedProduct = await this.productRepository.save(product);

    // Log audit
    await this.auditLogsService.log(
      null,
      'UPDATE_PRODUCT',
      `Product: ${updatedProduct.name} (ID: ${id})`,
    );

    return updatedProduct;
  }

  async remove(id: string): Promise<void> {
    const product = await this.findOne(id);

    // Log audit
    await this.auditLogsService.log(
      null,
      'DELETE_PRODUCT',
      `Product: ${product.name} (ID: ${id})`,
    );

    await this.productRepository.remove(product);
  }
}

import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Order } from '../../orders/entities/order.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'order_id', type: 'uuid', nullable: true })
  orderId: string;

  @Column({ name: 'product_id', type: 'uuid', nullable: true })
  productId: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number;

  @Column({ nullable: true })
  quantity: number;

  // Product snapshot at time of order (preserve product info even if product changes/deleted)
  @Column({ name: 'product_name', length: 255, nullable: true })
  productName: string;

  @Column({ name: 'product_brand', length: 100, nullable: true })
  productBrand: string;

  @Column({ name: 'product_color', length: 50, nullable: true })
  productColor: string;

  @Column({ name: 'product_size', length: 100, nullable: true, comment: 'e.g. W120xH80xD60cm' })
  productSize: string;

  @Column({ name: 'product_material', length: 255, nullable: true })
  productMaterial: string;

  @Column({ name: 'product_image_url', length: 500, nullable: true })
  productImageUrl: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}

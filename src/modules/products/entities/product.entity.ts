import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Category } from '../../categories/entities/category.entity';
import { User } from '../../users/entities/user.entity';
import { ProductImage } from '../../product-images/entities/product-image.entity';
import { CartItem } from '../../cart-items/entities/cart-item.entity';
import { OrderItem } from '../../order-items/entities/order-item.entity';
import { InventoryLog } from '../../inventory-logs/entities/inventory-log.entity';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price: number;

  @Column({ default: 0 })
  stock: number;

  @Column({ name: 'category_id', nullable: true })
  @Index('idx_products_category')
  categoryId: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ length: 100, nullable: true })
  brand: string;

  @Column({ length: 50, nullable: true })
  color: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Width in cm' })
  width: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Height in cm' })
  height: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Depth/Length in cm' })
  depth: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, comment: 'Weight in kg' })
  weight: number;

  @Column({ length: 255, nullable: true })
  material: string;

  @Column({ length: 50, nullable: true, comment: 'livingroom, bedroom, dining, office, outdoor' })
  @Index('idx_products_space')
  space: string;

  @Column({ length: 50, nullable: true, comment: 'Ngũ hành: Kim, Mộc, Thủy, Hỏa, Thổ' })
  @Index('idx_products_menh')
  menh: string;

  @Column({ length: 100, nullable: true, comment: 'Hướng phù hợp: Đông, Tây, Nam, Bắc, Đông Bắc, Đông Nam, Tây Bắc, Tây Nam' })
  huong: string;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdById: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @ManyToOne(() => Category, (category) => category.products)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @ManyToOne(() => User, (user) => user.products)
  @JoinColumn({ name: 'created_by' })
  createdBy: User;

  @OneToMany(() => ProductImage, (image) => image.product)
  images: ProductImage[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => InventoryLog, (log) => log.product)
  inventoryLogs: InventoryLog[];
}

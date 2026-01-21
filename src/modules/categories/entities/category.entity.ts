import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { CategoryGroup } from '../../category-groups/entities/category-group.entity';
import { Product } from '../../products/entities/product.entity';

@Entity('categories')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  name: string;

  @Column({ name: 'group_id', nullable: true })
  groupId: number;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => CategoryGroup, (group) => group.categories)
  @JoinColumn({ name: 'group_id' })
  group: CategoryGroup;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}

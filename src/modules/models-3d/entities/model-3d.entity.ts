import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('models_3d')
export class Model3D {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  /** URL tới file .glb/.gltf/.obj trên R2 */
  @Column({ name: 'model_url', type: 'text' })
  modelUrl: string;

  /** Thumbnail/preview image URL */
  @Column({ name: 'thumbnail_url', type: 'text', nullable: true })
  thumbnailUrl: string;

  /** Danh mục (furniture, decor, lighting, …) */
  @Column({ length: 100, nullable: true })
  category: string;

  /** Tags tìm kiếm */
  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  /** Tên file gốc */
  @Column({ name: 'file_name', length: 255, nullable: true })
  fileName: string;

  /** Kích thước file (bytes) */
  @Column({ name: 'file_size', type: 'bigint', nullable: true })
  fileSize: number;

  /** Định dạng: glb | gltf | obj | fbx */
  @Column({ name: 'file_format', length: 20, nullable: true })
  fileFormat: string;

  /** Giá bán (VNĐ), ví dụ: 5990000 */
  @Column({ type: 'bigint', nullable: true, default: 0 })
  price: number;

  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @Column({ name: 'created_by_id', nullable: true })
  @Index('idx_models3d_created_by')
  createdById: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'created_by_id' })
  createdBy: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}

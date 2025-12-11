import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne, OneToMany } from 'typeorm';
import { User } from './user.schema';
import { Category } from './category.schema';

@Entity('category_request')
export class CategoryRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number

  @ManyToOne(() => User, (user) => user.categoryrequests)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  provider_type: string; // service provider, material provider

  @Column({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
  category_name: string;

  @Column({ nullable: true })
  category_img: string;

  @Column({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
  ar_category_name: string;

  @Column({ nullable: true })
  parent_category_id: number;

  @ManyToOne(() => Category, (category) => category.parentcategorydata, { nullable: true })
  @JoinColumn({ name: 'parent_category_id' })
  parent_category: Category;

  @Column({ default: 'Requested' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
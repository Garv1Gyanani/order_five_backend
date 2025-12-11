import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.schema';
import { CategoryRequest } from './category_request.schema';

@Entity('category')
export class Category {
  @PrimaryGeneratedColumn()
  id: number;

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

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: null })
  category_req_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @ManyToOne(() => Category, category => category.children)
  @JoinColumn({ name: 'parent_category_id' })
  parent: Category;

  @OneToMany(() => Category, category => category.parent)
  children: Category[];

  @OneToMany(() => Product, Product => Product.category)
  categorydata: Product[];

  @OneToMany(() => CategoryRequest, (categoryRequest) => categoryRequest.parent_category)
  parentcategorydata: CategoryRequest[];
}

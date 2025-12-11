import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductRequest } from './product_request.schema';
import { Category } from './category.schema';

@Entity('product')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  provider_type: string //  service provider, material provider

  @Column({ nullable: true })
  product_name: string;

  @Column({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
  ar_product_name: string;

  @Column({ nullable: true })
  additional_info: string;

  @Column({ nullable: true })
  description_name: string;

  @Column({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
  ar_description_name: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  product_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delievery_charge: number;

  @Column({ default: 0 })
  delievery_address: string;

  @Column({ nullable: true })
  product_img: string;

  @Column({ nullable: true })
  product_unit: string;

  @Column({ nullable: true })
  category_id: number;

  @ManyToOne(() => Category, Category => Category.categorydata)
  @JoinColumn({ name: 'category_id' })
  category: Category;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: null })
  product_req_id: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => ProductRequest, ProductReq => ProductReq.product)
  productdata: ProductRequest[];
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { User } from './user.schema';
import { Product } from './product.schema';

@Entity('product_request')
export class ProductRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number

  @ManyToOne(() => User, user => user.productrequests)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  product_id: number

  @ManyToOne(() => Product, product => product.productdata)
  @JoinColumn({ name: 'product_id' })
  product: Product;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  product_price: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  delievery_charge: number;

  @Column({ default: 'Requested' })
  status: string; // Requested, Approved, Rejected

  @Column({ default: true })
  is_active: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductRequest } from './product_request.schema';
import { Category } from './category.schema';

@Entity('order')
export class Order {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    user_id: number

    @Column({ nullable: true })
    provider_id: number

    @Column({ nullable: true })
    address_id: number

    @Column({ nullable: true })
    product_id: number

    @Column({ nullable: true })
    order_id: string

    @Column({ nullable: true })
    distance: string

    @Column({ nullable: true })
    status: string

    @Column({ nullable: true })
    payment_type: string

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    totalprice: number

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    wallet: number

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    cash: number

    @Column({ type: "text", nullable: true })
    remark: string;

    
    @Column({ type: Date, nullable: true })
    delivery_date: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductRequest } from './product_request.schema';
import { Category } from './category.schema';

@Entity('rating')
export class Rating {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    user_id: number

    @Column({ nullable: true })
    provider_id: number

    @Column({ nullable: true })
    customer_id: number

    @Column({ nullable: true })
    review: string

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    rating: number

    @Column({ nullable: true })
    order_id: number

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
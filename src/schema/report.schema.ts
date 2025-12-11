import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { ProductRequest } from './product_request.schema';
import { Category } from './category.schema';

@Entity('report')
export class Report {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    user_id: number

    @Column({ nullable: true })
    provider_id: number

    @Column({ nullable: true })
    customer_id: number

    @Column({ nullable: true })
    name: string


    @Column({ nullable: true })
    dial_code: number


    @Column({ nullable: true })
    phone_num: number

    @Column({ nullable: true })
    issue: string

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;
}
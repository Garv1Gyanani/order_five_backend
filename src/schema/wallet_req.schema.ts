// src/entities/wallet_req.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { User } from './user.schema';

@Entity('wallet_req')
export class Wallet_req {
  @PrimaryGeneratedColumn()
  id: number;
 
  @Column({ nullable: true })
  user_id: number;

  @ManyToOne(() => User, user => user.walletRequests)
  @JoinColumn({ name: 'user_id' })
  user: User;  // Establish a relation to the User entity

  @Column({ nullable: true })
  user_type: string; // Customer, Provider

  @Column({ nullable: true })
  amount_status: string; // Credit, Debit

  @Column({ nullable: true })
  wallet_type: string; // Offline, Online

  @Column({ nullable: true })
  transaction_id: string;

  @Column({ default: '' })
  currency: string;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  amount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  available_amount: number;

  @Column({ nullable: true })
  remark: string;

  @Column({ nullable: true })
  order_type: string;

  @Column()
  date: Date;

  @Column({ nullable: true })
  document_url: string;

  @Column({ nullable: true, default: 'Requested' })
  status: string; // Requested, Accepted, Rejected

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deleteAt: Date;
}

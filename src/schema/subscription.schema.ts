import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('subscription')
export class Subscription {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  name : string;

  @Column({ nullable: true })
  ar_name : string;

  @Column({ nullable: true })
  duration: string;

  @Column({ nullable: true })
  duration_day: number;

  @Column({ nullable: true })
  amount: number;

  @Column({type:'text', nullable: true })
  features: string;

  @Column({ default: true })
  status: boolean;


  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn } from 'typeorm';

@Entity('settings')
export class Setting {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  key: string;

  @Column({ nullable: true })
  value: string;

  @Column({ nullable: true })
  title: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

// payment_active
// stripe_key
// stripe_secret
// bank_name
// account_holdar_name
// account_num
// swift_code
// iban_num
// addition_info
// smtp_host
// smtp_username
// smtp_pass
// smtp_port
// platform_charge_per_order
// customer_cancel_fees
// privacy_policy
// ar_privacy_policy
// terms_condition
// ar_terms_condition
// help
// ar_help
// contact_us
// ar_contact_us
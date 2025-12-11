  import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
  import { Wallet_req } from './wallet_req.schema';
  import { CategoryRequest } from './category_request.schema';
  import { ProductRequest } from './product_request.schema';

  @Entity('users')
  export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: true })
    image_url: string;

    @Column({ nullable: true })
    name: string;

    @Column({ nullable: true })
    dialing_code: number;

    @Column({ default: '' })
    remark: string;

    @Column({ default: '' })
    device_token: string;

    @Column({ default: null })
    status: string; // Pending, Approved, Rejected

    @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
    wallet_balance: number;

    @Column({ nullable: true })
    address_one: string;

    @Column({ nullable: true })
    address_two: string;

    @Column({ type: 'bigint', nullable: true })
    phone_num: number;

    @Column({ default: null })
    email: string;

    @Column({ nullable: true })
    password: string;

    @Column({ nullable: true })
    id_number: string;

    @Column({ nullable: true })
    vehical_name: string;

    @Column({ default: false })
    provider_profile: boolean;

    @Column({ nullable: true })
    vehical_plat_num: string;

    @Column({ type: 'json', nullable: true })
    custom_fields: string;

    @Column({ type: 'text', nullable: true })
    reset_password_token: string;


    @Column({ nullable: true, default: 3 })
    user_role: number; // admin : 1, provider: 2, customer: 3

    @Column({ default: true })
    is_active: boolean;

    @Column({ default: true })
    current_status: boolean;

    @Column({ default: false })
    is_block: boolean;

    @Column({ default: false })
    is_pr_block: boolean;

    @Column({ nullable: true })
    block_date: Date;

    @Column({ nullable: true })
    block_day: number;

    @Column({ nullable: true })
    subscription_id: number;

    @Column({ nullable: true })
    expiry_date: Date;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date;

    @OneToMany(() => Wallet_req, walletReq => walletReq.user)
    walletRequests: Wallet_req[];

    @OneToMany(() => CategoryRequest, CategoryReq => CategoryReq.user)
    categoryrequests: CategoryRequest[];

    @OneToMany(() => ProductRequest, ProductReq => ProductReq.user)
    productrequests: ProductRequest[]; // Note the plural form for consistency

  }

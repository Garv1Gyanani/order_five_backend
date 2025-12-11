import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, OneToMany } from 'typeorm';
import { User_document } from './user_document.schema';

@Entity('required_doc')
export class Required_doc {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '' })
  title: string;

  @Column({ type: 'varchar', length: 255, default: '', charset: 'utf8mb4', collation: 'utf8mb4_general_ci' })
  ar_title: string;

  @Column({ type: 'varchar', length: 255 })
  type: string;

  @Column({ default: true })
  is_active: boolean;

  @Column({ default: false })
  is_required: boolean;
 
  @Column({ type: 'json', nullable: true })
  custom_fields: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;

  @OneToMany(() => User_document, User_document => User_document.required_doc)
  userdocumentrequests: User_document[];
}

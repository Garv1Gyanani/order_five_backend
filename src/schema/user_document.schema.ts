import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, JoinColumn, ManyToOne } from 'typeorm';
import { Required_doc } from './required_doc.schema';

@Entity('user_document')
export class User_document {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  user_id: number;

  @Column({ nullable: true })
  required_doc_id: number;

  @ManyToOne(() => Required_doc, Required_doc => Required_doc.userdocumentrequests)
  @JoinColumn({ name: 'required_doc_id' })
  required_doc: Required_doc;

  @Column({ nullable: true, default: '' })
  document: string;

  @Column({ nullable: true, default: 'Requested' })
  status: string; // Requested , Verified, Rejected

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}

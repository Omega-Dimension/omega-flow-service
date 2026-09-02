import {
  Column,
  ColumnTypeUndefinedError,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Project } from '../../project/entities/project.entity';
import { InvoiceItem } from './invoice-item.entity';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';
import { Payment } from '../../payment/entities/payment.entity';

@Entity('invoice')
@Index(['freelancer_profile_id', 'invoice_number'], {unique : true})
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  freelancer_profile_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id?: string;

  @Column({ type: 'varchar', length: 100 })
  invoice_number: string;

  @Column({ type: 'varchar', length: 30, default: 'draft' })
  status: string;

  @Column({
    type: 'decimal',
    precision: 5,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  tax_percent: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  sub_total: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  tax_amount: number;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    default: 0,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  total: number;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'text', nullable: true })
  payment_terms?: string;

  @Column({ type: 'date', nullable: true })
  due_date?: Date;

  @Column({ type: 'timestamp', nullable: true })
  paid_at?: Date;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  /**
   * Relations
   */
  @ManyToOne(() => Client, (client) => client.invoices)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client: Client;

  @ManyToOne(() => Project, (project) => project.invoices)
  @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
  project: Project;

  @OneToMany(() => InvoiceItem, (invoiceItem) => invoiceItem.invoice)
  invoice_items: InvoiceItem[];


  @OneToMany(() => Payment, (payment) => payment.invoice)
  payments : Payment[];

  @ManyToOne(
    () => FreelancerProfile,
    (freelancer_profile) => freelancer_profile.invoices,
  )
  @JoinColumn({ name: 'freelancer_profile_id', referencedColumnName: 'id' })
  freelancer_profile: FreelancerProfile;
}

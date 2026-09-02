import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Client } from '../../client/entities/client.entity';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';

export enum PaymentMethod {
  KPAY = 'kpay',
  WAVE_PAY = 'wave_pay',
  BANK_TRANSFER = 'bank_transfer',
  CASH = 'cash',
  STRIPE = 'stripe', // reserved for later, not used by the manual proof flow
  OTHER = 'other',
}

export enum PaymentStatus {
  PENDING = 'pending', // client submitted, waiting on freelancer
  CONFIRMED = 'confirmed', // freelancer confirmed -> invoice marked paid
  REJECTED = 'rejected', // freelancer rejected -> client must resubmit
}

/**
 * Manual payment proof record.
 *
 * Myanmar mobile-money rails (KPay, Wave Pay) and local bank transfers don't
 * have a programmatic settlement API for most freelancers, so instead of a
 * payment-gateway webhook, the client uploads a screenshot of the transfer
 * and the freelancer confirms it manually. `screenshot_url` is a Cloudinary
 * URL uploaded via the same flow already used for portfolio images.
 */
@Entity('payments')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  invoice_id: string;

  @Index()
  @Column({ type: 'uuid' })
  freelancer_profile_id: string;

  @Index()
  @Column({ type: 'uuid' })
  client_id: string;

  @Column({
    type: 'decimal',
    precision: 12,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  amount: number;

  @Column({ type: 'varchar', length: 10, default: 'MMK' })
  currency: string;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.KPAY })
  payment_method: PaymentMethod;

  @Column({ type: 'varchar', length: 100, nullable: true })
  transaction_reference?: string; // KPay/Wave transaction ID, if the client has one

  @Column({ type: 'text' })
  screenshot_url: string; // Cloudinary URL of the payment proof screenshot

  @Column({ type: 'varchar', length: 20, default: PaymentStatus.PENDING })
  status: string;

  @Index()
  @Column({ type: 'uuid' })
  submitted_by: string; // user.id of the client who uploaded the proof

  @Column({ type: 'uuid', nullable: true })
  reviewed_by?: string; // user.id of the freelancer who confirmed/rejected

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at?: Date;

  @Column({ type: 'text', nullable: true })
  rejection_reason?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  /**
   * Relations
   */
  @ManyToOne(() => Invoice, (invoice) => invoice.payments)
  @JoinColumn({ name: 'invoice_id', referencedColumnName: 'id' })
  invoice: Invoice;

  @ManyToOne(() => Client, (client) => client.payments)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client: Client;

  @ManyToOne(
    () => FreelancerProfile,
    (freelancer_profile) => freelancer_profile.payments,
  )
  @JoinColumn({ name: 'freelancer_profile_id', referencedColumnName: 'id' })
  freelancer_profile: FreelancerProfile;
}
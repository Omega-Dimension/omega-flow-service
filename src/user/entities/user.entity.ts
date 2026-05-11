import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true, type: 'varchar', length: 255 })
  email: string;

  @Column({ type: 'text' })
  password: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  company_name?: string;

  @Column({ type: 'text', nullable: true })
  company_address?: string;

  @Column({ type: 'text', nullable: true })
  logo_url?: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  default_currency: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  default_tax_percent: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;
}

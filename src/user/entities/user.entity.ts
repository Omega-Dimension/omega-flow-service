import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Project } from '../../project/entities/project.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  /**
   * User email (unique + indexed for fast lookup)
   */
  @Index()
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

  /**
   * Tax percentage stored as decimal
   * Uses transformer to handle DB string ↔ number conversion
   */
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
  default_tax_percent: number;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  @OneToMany(() => Client, (client) => client.user)
  clients: Client[];

  @OneToMany(() => Project, (project) => project.user)
  projects : Project[];
}

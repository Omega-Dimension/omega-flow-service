import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Project } from '../../project/entities/project.entity';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  freelancer_profile_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

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

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  currency: string;

  @Column({ type: 'date' })
  start_date: Date;

  @Column({ type: 'date', nullable: true })
  end_date?: Date;

  @Column({ type: 'varchar', length: 30, default: 'draft' })
  status: string;

  @Column({ type: 'boolean', default: false })
  client_signed: boolean;

  @Column({ type: 'boolean', default: false })
  freelancer_signed: boolean;

  @Column({ type: 'text', nullable: true })
  contract_file?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  /**
   * Relations
   */
  @ManyToOne(
    () => FreelancerProfile,
    (freelancer_profile) => freelancer_profile.contracts,
  )
  @JoinColumn({ name: 'freelancer_profile_id', referencedColumnName: 'id' })
  freelancer_profile: FreelancerProfile;

  @ManyToOne(() => Client, (client) => client.contracts)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client: Client;

  @ManyToOne(() => Project, (project) => project.contracts)
  @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
  project: Project;
}

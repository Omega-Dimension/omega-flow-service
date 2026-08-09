import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Client } from '../../client/entities/client.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Timelog } from '../../timelog/entities/timelog.entity';
import { Review } from '../../review/entities/review.entity';
import { Contract } from '../../contract/entities/contract.entity';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';
import { Meeting } from '../../meeting/entities/meeting.entity';

@Entity('project')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'uuid' })
  freelancer_profile_id: string;

  @Index()
  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 30, default: 'pending' })
  status: string;

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
  budget: number;

  @Column({ type: 'text', nullable: true })
  deadline?: Date;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  /**
   * Relations
   */

  @ManyToOne(() => Client, (client) => client.projects)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client: Client;

  @OneToMany(() => Invoice, (invoice) => invoice.project)
  invoices: Invoice[];

  @OneToMany(() => Timelog, (timelog) => timelog.project)
  time_logs: Timelog[];

  @OneToMany(() => Review, (review) => review.project)
  reviews: Review[];

  @OneToMany(() => Contract, (contract) => contract.project)
  contracts: Contract[];

  @ManyToOne(() => FreelancerProfile, (freelancer) => freelancer.projects)
  @JoinColumn({name : "freelancer_profile_id", referencedColumnName : "id"})
  freelancer_profile : FreelancerProfile;

  @OneToMany(() => Meeting, (meeting) => meeting.project)
  meetings : Meeting[];
}

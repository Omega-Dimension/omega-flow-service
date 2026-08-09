import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
import { Contract } from '../../contract/entities/contract.entity';
import { Meeting } from '../../meeting/entities/meeting.entity';
import { Client } from '../../client/entities/client.entity';
import { Portfolio } from '../../portfolio/entities/portfolio.entity';

@Entity('freelancer_profile')
export class FreelancerProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', unique: true })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  profile_image?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  headline?: string;

  @Column({ type: 'text', nullable: true })
  bio?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  @Column({ type: 'text', nullable: true })
  website?: string;

  @Column({ type: 'text', nullable: true })
  linkedin_url?: string;

  @Column({ type: 'text', nullable: true })
  github_url?: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  company_name?: string;

  @Column({ type: 'text', nullable: true })
  company_address?: string;

  @Column({ type: 'text', nullable: true })
  logo_url?: string;

  @Column({ type: 'varchar', length: 10, default: 'USD' })
  default_currency: string;

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

  @Column({ type: 'boolean', default: true })
  is_public: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  /**
   * Relations
   */


  @OneToOne(() => User, (user) => user.freelancer_profile)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @OneToMany(() => Client, (client) => client.freelancer_profile)
  clients : Client[];

  @OneToMany(() => Project, (project) => project.freelancer_profile)
  projects : Project[];

  @OneToMany(() => Contract, (contract) => contract.freelancer_profile)
  contracts : Contract[];

  @OneToMany(() => Meeting, (meeting) => meeting.freelancer_profile)
  meetings : Meeting[];

  @OneToMany(() => Portfolio, (portfolio) => portfolio.freelancer_profile)
  portfolios : Portfolio[];

}
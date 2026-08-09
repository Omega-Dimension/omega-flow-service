import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';

@Entity('portfolios')
export class Portfolio {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  freelancer_profile_id: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', nullable: true })
  image_url?: string;

  @Column({ type: 'text', nullable: true })
  project_url?: string;

  @Column({ type: 'text', nullable: true })
  github_url?: string;

  @Column({ type: 'text', nullable: true })
  technologies?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  /**
   * Relations
   */
  @ManyToOne(
    () => FreelancerProfile,
    (freelancer_profile) => freelancer_profile.portfolios,
  )
  @JoinColumn({ name: 'freelancer_profile_id', referencedColumnName: 'id' })
  freelancer_profile: FreelancerProfile;
}

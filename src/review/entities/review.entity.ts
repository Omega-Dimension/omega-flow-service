import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Client } from '../../client/entities/client.entity';
import { Project } from '../../project/entities/project.entity';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';
import { ReviewerType } from '../../libs/constants';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  freelancer_profile_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'varchar', length: 30 })
  reviewer_type: ReviewerType;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title?: string;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  /**
   * Relations
   */
  @ManyToOne(
    () => FreelancerProfile,
    (freelancer_profile) => freelancer_profile.reviews,
  )
  @JoinColumn({ name: 'freelancer_profile_id', referencedColumnName: 'id' })
  freelancer_profile: FreelancerProfile;

  @ManyToOne(() => Client, (client) => client.reviews)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client: Client;

  @ManyToOne(() => Project, (project) => project.reviews)
  @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
  project: Project;
}
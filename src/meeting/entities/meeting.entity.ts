import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Client } from '../../client/entities/client.entity';
import { Project } from '../../project/entities/project.entity';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';

@Entity('meetings')
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid', nullable: true })
  project_id?: string;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  meeting_platform?: string;

  @Column({ type: 'text', nullable: true })
  meeting_url?: string;

  @Column({ type: 'timestamp' })
  scheduled_at: Date;

  @Column({ type: 'int', default: 30 })
  duration_minutes: number;

  @Column({ type: 'varchar', length: 30, default: 'scheduled' })
  status: string;

  @Column({ type: 'uuid' })
  created_by: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  /**
   * Relations
   */

  @ManyToOne(() => FreelancerProfile, (freelancer_profile) => freelancer_profile.meetings)
  @JoinColumn({name : "freelancer_id", referencedColumnName : "id"})
  freelancer_profile : FreelancerProfile;

  @ManyToOne(() => Client, (client) => client.meetings)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client: Client;

  @ManyToOne(() => Project, (project) => project.meetings)
  @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
  project?: Project;


}
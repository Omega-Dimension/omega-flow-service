import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Client } from '../../client/entities/client.entity';
import { Project } from '../../project/entities/project.entity';

@Entity('reviews')
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  client_id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'int' })
  rating: number;

  @Column({ type: 'text', nullable: true })
  comment?: string;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  /**
   * Relations
   */
  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  @ManyToOne(() => Client, (client) => client.reviews)
  @JoinColumn({ name: 'client_id', referencedColumnName: 'id' })
  client: Client;

  @ManyToOne(() => Project, (project) => project.reviews)
  @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
  project: Project;
}
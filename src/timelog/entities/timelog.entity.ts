import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';

@Entity('time_logs')
export class Timelog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  project_id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'date' })
  log_date: Date;

  @Column({ type: 'time', nullable: true })
  start_time?: string;

  @Column({ type: 'time', nullable: true })
  end_time?: string;

  @Column({
    type: 'decimal',
    precision: 6,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: (value: string) => parseFloat(value),
    },
  })
  hours: number;

  @Column({ type: 'boolean', default: true })
  is_billable: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  /**
   * Relations
   */
  @ManyToOne(() => Project, (project) => project.time_logs)
  @JoinColumn({ name: 'project_id', referencedColumnName: 'id' })
  project: Project;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;
}
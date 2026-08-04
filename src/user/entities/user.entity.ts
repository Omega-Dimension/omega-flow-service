import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';
import { ClientProfile } from '../../client-profile/entities/client-profile.entity';
import { WorkspaceType } from '../../libs/interfaces/workspace';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  name: string;

  @Index()
  @Column({
    unique: true,
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true, type: 'enum', enum: ['freelancer', 'client'] })
  default_workspace?: WorkspaceType;

  @Column({ nullable: true, unique: true })
  firebase_uid?: string;

  @Column({ type: 'enum', enum: ['local', 'google'], default: 'local' })
  provider: 'local' | 'google';

  @Column({
    default: true,
  })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  /**
   * Relations
   */
  @OneToOne(
    () => FreelancerProfile,
    (freelancer_profile) => freelancer_profile.user,
  )
  freelancer_profile: FreelancerProfile;

  @OneToOne(() => ClientProfile, (clientProfile) => clientProfile.user)
  client_profile: ClientProfile;
}

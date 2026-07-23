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
@Entity('user')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({
    unique: true,
    type: 'varchar',
    length: 255,
  })
  email: string;

  @Column()
  password: string;

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

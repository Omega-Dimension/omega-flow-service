import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../user/entities/user.entity';
import { Project } from '../../project/entities/project.entity';
import { Invoice } from '../../invoice/entities/invoice.entity';
import { Review } from '../../review/entities/review.entity';
import { Contract } from '../../contract/entities/contract.entity';
import { Meeting } from '../../meeting/entities/meeting.entity';
import { ClientProfile } from '../../client-profile/entities/client-profile.entity';
import { FreelancerProfile } from '../../freelancer-profile/entities/freelancer-profile.entity';

@Entity('client')
export class Client {
  @PrimaryGeneratedColumn('uuid')
  id: string;
 
  @Index()
  @Column({name : "freelancer_profile_id", type : "uuid"})
  freelancer_profile_id: string;

  @Index()
  @Column({name : "client_profile_id", type : "uuid", nullable : true})
  client_profile_id?: string;

  @Column({ type: 'varchar', length: 150 })
  name: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  company?: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string;

  @Column({ type: 'varchar', length: 30, nullable: true })
  phone?: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @DeleteDateColumn({ name: 'deleted_at', nullable: true })
  deleted_at?: Date;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  created_at: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updated_at: Date;

  /**
   * Relations
   */

   @ManyToOne(
    () => FreelancerProfile,
    (freelancer) => freelancer.clients,
    {
      onDelete: 'CASCADE',
    },
  )
  @JoinColumn({
    name: 'freelancer_profile_id',
    referencedColumnName: 'id',
  })
  freelancer_profile: FreelancerProfile;

    // Optional registered client account
  @ManyToOne(
    () => ClientProfile,
    (clientProfile) => clientProfile.clients,
    {
      nullable: true,
      onDelete: 'SET NULL',
    },
  )
  @JoinColumn({
    name: 'client_profile_id',
    referencedColumnName: 'id',
  })
  client_profile?: ClientProfile;

  @OneToMany(() => Contract, (contract) => contract.client)
  contracts: Contract[];

  @OneToMany(() => Review, (review) => review.client)
  reviews: Review[];

  @OneToMany(() => Project, (project) => project.client)
  projects: Project[];

  @OneToMany(() => Invoice, (invoice) => invoice.client)
  invoices: Invoice[];

  @OneToMany(() => Meeting, (meeting) => meeting.client)
  meetings : Meeting[];
}

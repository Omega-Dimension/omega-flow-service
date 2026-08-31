import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('notifications')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  user_id: string; // notification ကို ဘယ်သူ့ဆီ ပို့မှာလဲ

  @Column()
  type: string; // 'meeting:new' | 'meeting:update' | ...

  @Column({ type: 'jsonb', nullable: true })
  payload: Record<string, any>;

  @Column({ default: false })
  is_read: boolean;

  @CreateDateColumn()
  created_at: Date;
}
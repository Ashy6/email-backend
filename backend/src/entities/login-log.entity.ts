import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Profile } from './profile.entity';

@Entity('login_logs')
@Index(['user_id'])
@Index(['login_at'])
@Index(['ip_address'])
export class LoginLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'inet' })
  ip_address: string;

  @Column({ type: 'text', nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 50, default: 'success' })
  status: string; // success, failed, blocked

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  @CreateDateColumn()
  login_at: Date;

  // 关联关系
  @ManyToOne(() => Profile, (profile) => profile.loginLogs, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  profile: Profile;
}
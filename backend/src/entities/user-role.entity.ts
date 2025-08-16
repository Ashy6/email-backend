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
import { Role } from './role.entity';

@Entity('user_roles')
@Index(['user_id', 'role_id'], { unique: true })
@Index(['user_id'])
@Index(['role_id'])
export class UserRole {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  user_id: string;

  @Column({ type: 'uuid' })
  role_id: string;

  @CreateDateColumn()
  assigned_at: Date;

  // 关联关系
  @ManyToOne(() => Profile, (profile) => profile.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'user_id' })
  profile: Profile;

  @ManyToOne(() => Role, (role) => role.userRoles, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'role_id' })
  role: Role;
}
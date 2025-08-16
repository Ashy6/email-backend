import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserController } from './user.controller';
import { UserService } from './user.service';

import { Profile } from '../../entities/profile.entity';
import { UserRole } from '../../entities/user-role.entity';
import { LoginLog } from '../../entities/login-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Profile, UserRole, LoginLog])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';

import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { RoleModule } from './modules/role/role.module';
import { SettingsModule } from './modules/settings/settings.module';
import { EmailModule } from './modules/email/email.module';

import { Profile } from './entities/profile.entity';
import { Role } from './entities/role.entity';
import { UserRole } from './entities/user-role.entity';
import { LoginLog } from './entities/login-log.entity';
import { Settings } from './entities/settings.entity';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    // 数据库模块
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT, 10) || 5432,
      username: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Profile, Role, UserRole, LoginLog, Settings],
      synchronize: process.env.NODE_ENV === 'development',
      logging: process.env.NODE_ENV === 'development',
      ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
    }),

    // Redis 缓存模块
    CacheModule.register({
      isGlobal: true,
      store: redisStore as any,
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      password: process.env.REDIS_PASSWORD,
      ttl: 300, // 5 minutes
    }),

    // 限流模块
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: parseInt(process.env.RATE_LIMIT_TTL, 10) || 60000, // 1 minute
        limit: parseInt(process.env.RATE_LIMIT_LIMIT, 10) || 10,
      },
      {
        name: 'medium',
        ttl: 60000 * 10, // 10 minutes
        limit: 100,
      },
      {
        name: 'long',
        ttl: 60000 * 60, // 1 hour
        limit: 1000,
      },
    ]),

    // 业务模块
    AuthModule,
    UserModule,
    RoleModule,
    SettingsModule,
    EmailModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
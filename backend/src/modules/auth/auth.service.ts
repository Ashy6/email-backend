import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as crypto from 'crypto';

import { Profile } from '../../entities/profile.entity';
import { LoginLog } from '../../entities/login-log.entity';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(LoginLog)
    private loginLogRepository: Repository<LoginLog>,
    private jwtService: JwtService,
    private emailService: EmailService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async sendVerificationCode(
    email: string,
    clientIp: string,
    userAgent: string,
  ): Promise<void> {
    // 检查发送频率限制
    const rateLimitKey = `send_code:${email}`;
    const lastSent = await this.cacheManager.get(rateLimitKey);
    
    if (lastSent) {
      throw new BadRequestException('请等待60秒后再次发送验证码');
    }

    // 生成6位数字验证码
    const code = crypto.randomInt(100000, 999999).toString();
    
    // 存储验证码到缓存，有效期5分钟
    const codeKey = `verify_code:${email}`;
    const codeExpiry = parseInt(process.env.EMAIL_CODE_EXPIRY, 10) || 300; // 5 minutes
    
    await this.cacheManager.set(codeKey, code, codeExpiry * 1000);
    await this.cacheManager.set(rateLimitKey, Date.now(), 60 * 1000); // 1 minute rate limit

    // 发送邮件
    await this.emailService.sendVerificationCode(email, code);
  }

  async verifyCodeAndLogin(
    email: string,
    code: string,
    clientIp: string,
    userAgent: string,
  ): Promise<{ access_token: string; user: any }> {
    // 验证验证码
    const codeKey = `verify_code:${email}`;
    const storedCode = await this.cacheManager.get(codeKey);
    
    if (!storedCode || storedCode !== code) {
      // 记录失败的登录尝试
      await this.logLoginAttempt(email, clientIp, userAgent, 'failed', '验证码错误或已过期');
      throw new UnauthorizedException('验证码错误或已过期');
    }

    // 清除验证码
    await this.cacheManager.del(codeKey);

    // 查找或创建用户档案
    let profile = await this.profileRepository.findOne({
      where: { user_id: email }, // 使用email作为user_id的临时方案
    });

    if (!profile) {
      // 创建新用户档案
      profile = this.profileRepository.create({
        user_id: crypto.randomUUID(), // 生成真实的UUID
        full_name: email.split('@')[0], // 使用邮箱前缀作为默认姓名
        status: 'active',
      });
      profile = await this.profileRepository.save(profile);
    }

    // 记录成功的登录
    await this.logLoginAttempt(profile.user_id, clientIp, userAgent, 'success');

    // 生成JWT令牌
    const payload = {
      userId: profile.user_id,
      email: email,
      sub: profile.id,
    };
    
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: profile.id,
        user_id: profile.user_id,
        email: email,
        full_name: profile.full_name,
        avatar_url: profile.avatar_url,
        status: profile.status,
      },
    };
  }

  async getProfile(userId: string): Promise<Profile> {
    const profile = await this.profileRepository.findOne({
      where: { user_id: userId },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!profile) {
      throw new UnauthorizedException('用户不存在');
    }

    return profile;
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const profile = await this.getProfile(userId);
    
    const payload = {
      userId: profile.user_id,
      sub: profile.id,
    };
    
    const access_token = this.jwtService.sign(payload);
    
    return { access_token };
  }

  private async logLoginAttempt(
    userId: string,
    clientIp: string,
    userAgent: string,
    status: string,
    failureReason?: string,
  ): Promise<void> {
    try {
      const loginLog = this.loginLogRepository.create({
        user_id: userId,
        ip_address: clientIp,
        user_agent: userAgent,
        status,
        failure_reason: failureReason,
      });
      
      await this.loginLogRepository.save(loginLog);
    } catch (error) {
      // 登录日志记录失败不应该影响主要流程
      console.error('Failed to log login attempt:', error);
    }
  }

  async validateUser(payload: any): Promise<any> {
    const profile = await this.profileRepository.findOne({
      where: { user_id: payload.userId },
    });
    
    if (!profile || profile.status !== 'active') {
      throw new UnauthorizedException('用户不存在或已被禁用');
    }
    
    return {
      userId: profile.user_id,
      profileId: profile.id,
      email: payload.email,
    };
  }
}
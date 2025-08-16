import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Settings } from '../../entities/settings.entity';
import { UpdateSettingDto } from './dto/settings.dto';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private settingsRepository: Repository<Settings>,
  ) {
    this.initializeDefaultSettings();
  }

  async getSettings(category?: string) {
    const queryBuilder = this.settingsRepository.createQueryBuilder('settings');
    
    if (category) {
      queryBuilder.where('settings.key LIKE :category', {
        category: `${category}.%`,
      });
    }
    
    queryBuilder.orderBy('settings.key', 'ASC');
    
    const settings = await queryBuilder.getMany();
    
    // 按分类组织设置
    const groupedSettings = {};
    
    settings.forEach(setting => {
      const parts = setting.key.split('.');
      const category = parts[0];
      const key = parts.slice(1).join('.');
      
      if (!groupedSettings[category]) {
        groupedSettings[category] = {};
      }
      
      groupedSettings[category][key] = {
        value: setting.value,
        description: setting.description,
        updated_at: setting.updated_at,
      };
    });
    
    return groupedSettings;
  }

  async getSetting(key: string): Promise<Settings> {
    const setting = await this.settingsRepository.findOne({
      where: { key },
    });

    if (!setting) {
      throw new NotFoundException(`设置 ${key} 不存在`);
    }

    return setting;
  }

  async updateSetting(key: string, updateSettingDto: UpdateSettingDto): Promise<Settings> {
    const setting = await this.getSetting(key);
    
    if (updateSettingDto.value !== undefined) {
      setting.value = updateSettingDto.value;
    }
    
    if (updateSettingDto.description !== undefined) {
      setting.description = updateSettingDto.description;
    }
    
    setting.updated_at = new Date();
    
    return await this.settingsRepository.save(setting);
  }

  async getCategories() {
    const settings = await this.settingsRepository.find();
    
    const categories = new Set<string>();
    
    settings.forEach(setting => {
      const category = setting.key.split('.')[0];
      categories.add(category);
    });
    
    return Array.from(categories).sort();
  }

  private async initializeDefaultSettings() {
    const defaultSettings = [
      // 系统设置
      {
        key: 'system.name',
        value: { text: '用户管理系统' },
        description: '系统名称',
      },
      {
        key: 'system.description',
        value: { text: '基于 React + NestJS 的现代化用户管理系统' },
        description: '系统描述',
      },
      {
        key: 'system.version',
        value: { text: '1.0.0' },
        description: '系统版本',
      },
      {
        key: 'system.timezone',
        value: { text: 'Asia/Shanghai' },
        description: '系统时区',
      },
      {
        key: 'system.language',
        value: { text: 'zh-CN' },
        description: '系统语言',
      },
      {
        key: 'system.logo_url',
        value: { text: '' },
        description: '系统Logo URL',
      },
      
      // 邮件设置
      {
        key: 'email.smtp_enabled',
        value: { boolean: false },
        description: '启用SMTP邮件发送',
      },
      {
        key: 'email.smtp_host',
        value: { text: '' },
        description: 'SMTP服务器地址',
      },
      {
        key: 'email.smtp_port',
        value: { number: 587 },
        description: 'SMTP端口',
      },
      {
        key: 'email.smtp_secure',
        value: { boolean: false },
        description: '启用SSL/TLS',
      },
      {
        key: 'email.smtp_user',
        value: { text: '' },
        description: 'SMTP用户名',
      },
      {
        key: 'email.from_name',
        value: { text: '用户管理系统' },
        description: '发件人名称',
      },
      {
        key: 'email.from_address',
        value: { text: 'noreply@example.com' },
        description: '发件人邮箱',
      },
      
      // 安全设置
      {
        key: 'security.code_expire_minutes',
        value: { number: 5 },
        description: '验证码有效期（分钟）',
      },
      {
        key: 'security.code_rate_limit',
        value: { number: 5 },
        description: '验证码发送频率限制（次/小时）',
      },
      {
        key: 'security.jwt_expire_hours',
        value: { number: 24 },
        description: 'JWT令牌有效期（小时）',
      },
      {
        key: 'security.refresh_token_expire_days',
        value: { number: 30 },
        description: '刷新令牌有效期（天）',
      },
      {
        key: 'security.max_login_attempts',
        value: { number: 5 },
        description: '最大登录尝试次数',
      },
      {
        key: 'security.lockout_duration_minutes',
        value: { number: 30 },
        description: '账户锁定时长（分钟）',
      },
      
      // 功能设置
      {
        key: 'features.user_registration',
        value: { boolean: true },
        description: '允许用户注册',
      },
      {
        key: 'features.email_verification',
        value: { boolean: true },
        description: '启用邮箱验证',
      },
      {
        key: 'features.avatar_upload',
        value: { boolean: true },
        description: '允许头像上传',
      },
      {
        key: 'features.dark_mode',
        value: { boolean: true },
        description: '启用深色模式',
      },
      {
        key: 'features.multi_language',
        value: { boolean: false },
        description: '启用多语言支持',
      },
    ];

    for (const defaultSetting of defaultSettings) {
      const existing = await this.settingsRepository.findOne({
        where: { key: defaultSetting.key },
      });

      if (!existing) {
        const setting = this.settingsRepository.create(defaultSetting);
        await this.settingsRepository.save(setting);
      }
    }
  }

  async getSystemInfo() {
    const systemSettings = await this.getSettings('system');
    const securitySettings = await this.getSettings('security');
    const featureSettings = await this.getSettings('features');
    
    return {
      system: systemSettings.system || {},
      security: securitySettings.security || {},
      features: featureSettings.features || {},
      server: {
        node_version: process.version,
        platform: process.platform,
        uptime: process.uptime(),
        memory_usage: process.memoryUsage(),
      },
    };
  }
}
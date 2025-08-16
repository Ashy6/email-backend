import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsObject } from 'class-validator';

export class UpdateSettingDto {
  @ApiPropertyOptional({
    description: '设置值',
    example: { text: '用户管理系统' },
  })
  @IsOptional()
  @IsObject({ message: '设置值必须是对象' })
  value?: Record<string, any>;

  @ApiPropertyOptional({ description: '设置描述', example: '系统名称' })
  @IsOptional()
  @IsString({ message: '设置描述必须是字符串' })
  description?: string;
}

export class SettingsQueryDto {
  @ApiPropertyOptional({ description: '设置分类', example: 'system' })
  @IsOptional()
  @IsString({ message: '设置分类必须是字符串' })
  category?: string;
}
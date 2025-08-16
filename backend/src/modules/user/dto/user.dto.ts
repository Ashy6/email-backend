import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  IsUrl,
  IsInt,
  Min,
  Max,
  Length,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateUserDto {
  @ApiProperty({ description: '邮箱地址', example: 'user@example.com' })
  @IsEmail({}, { message: '请输入有效的邮箱地址' })
  email: string;

  @ApiProperty({ description: '用户姓名', example: '张三' })
  @IsString({ message: '姓名必须是字符串' })
  @Length(1, 255, { message: '姓名长度必须在1-255个字符之间' })
  full_name: string;

  @ApiPropertyOptional({ description: '手机号码', example: '+8613800138000' })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '请输入有效的手机号码' })
  phone?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsUrl({}, { message: '请输入有效的URL' })
  avatar_url?: string;

  @ApiPropertyOptional({
    description: '用户状态',
    enum: ['active', 'inactive', 'suspended'],
    default: 'active',
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'], {
    message: '状态必须是 active、inactive 或 suspended',
  })
  status?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ description: '用户姓名', example: '张三' })
  @IsOptional()
  @IsString({ message: '姓名必须是字符串' })
  @Length(1, 255, { message: '姓名长度必须在1-255个字符之间' })
  full_name?: string;

  @ApiPropertyOptional({ description: '手机号码', example: '+8613800138000' })
  @IsOptional()
  @IsPhoneNumber('CN', { message: '请输入有效的手机号码' })
  phone?: string;

  @ApiPropertyOptional({ description: '头像URL' })
  @IsOptional()
  @IsUrl({}, { message: '请输入有效的URL' })
  avatar_url?: string;
}

export class UpdateUserStatusDto {
  @ApiProperty({
    description: '用户状态',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsEnum(['active', 'inactive', 'suspended'], {
    message: '状态必须是 active、inactive 或 suspended',
  })
  status: string;
}

export class UserQueryDto {
  @ApiPropertyOptional({ description: '页码', default: 1, minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '页码必须是整数' })
  @Min(1, { message: '页码必须大于0' })
  page?: number = 1;

  @ApiPropertyOptional({
    description: '每页数量',
    default: 20,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: '每页数量必须是整数' })
  @Min(1, { message: '每页数量必须大于0' })
  @Max(100, { message: '每页数量不能超过100' })
  limit?: number = 20;

  @ApiPropertyOptional({ description: '搜索关键词' })
  @IsOptional()
  @IsString({ message: '搜索关键词必须是字符串' })
  @Transform(({ value }) => value?.trim())
  search?: string;

  @ApiPropertyOptional({
    description: '用户状态筛选',
    enum: ['active', 'inactive', 'suspended'],
  })
  @IsOptional()
  @IsEnum(['active', 'inactive', 'suspended'], {
    message: '状态必须是 active、inactive 或 suspended',
  })
  status?: string;

  @ApiPropertyOptional({
    description: '排序字段',
    enum: ['created_at', 'updated_at', 'full_name'],
    default: 'created_at',
  })
  @IsOptional()
  @IsEnum(['created_at', 'updated_at', 'full_name'], {
    message: '排序字段必须是 created_at、updated_at 或 full_name',
  })
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({
    description: '排序方向',
    enum: ['ASC', 'DESC'],
    default: 'DESC',
  })
  @IsOptional()
  @IsEnum(['ASC', 'DESC'], {
    message: '排序方向必须是 ASC 或 DESC',
  })
  sortOrder?: string = 'DESC';
}
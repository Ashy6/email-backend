import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsObject,
  IsInt,
  Min,
  Max,
  Length,
  IsEnum,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class CreateRoleDto {
  @ApiProperty({ description: '角色名称', example: '管理员' })
  @IsString({ message: '角色名称必须是字符串' })
  @Length(1, 100, { message: '角色名称长度必须在1-100个字符之间' })
  name: string;

  @ApiPropertyOptional({ description: '角色描述', example: '系统管理员角色' })
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  description?: string;

  @ApiPropertyOptional({
    description: '权限配置',
    example: {
      users: ['users:read', 'users:create', 'users:update'],
      roles: ['roles:read'],
    },
  })
  @IsOptional()
  @IsObject({ message: '权限配置必须是对象' })
  permissions?: Record<string, string[]>;
}

export class UpdateRoleDto {
  @ApiPropertyOptional({ description: '角色名称', example: '管理员' })
  @IsOptional()
  @IsString({ message: '角色名称必须是字符串' })
  @Length(1, 100, { message: '角色名称长度必须在1-100个字符之间' })
  name?: string;

  @ApiPropertyOptional({ description: '角色描述', example: '系统管理员角色' })
  @IsOptional()
  @IsString({ message: '角色描述必须是字符串' })
  description?: string;

  @ApiPropertyOptional({
    description: '权限配置',
    example: {
      users: ['users:read', 'users:create', 'users:update'],
      roles: ['roles:read'],
    },
  })
  @IsOptional()
  @IsObject({ message: '权限配置必须是对象' })
  permissions?: Record<string, string[]>;
}

export class RoleQueryDto {
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
    description: '排序字段',
    enum: ['created_at', 'updated_at', 'name'],
    default: 'created_at',
  })
  @IsOptional()
  @IsEnum(['created_at', 'updated_at', 'name'], {
    message: '排序字段必须是 created_at、updated_at 或 name',
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
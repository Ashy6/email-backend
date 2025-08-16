import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';

import { RoleService } from './role.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from './dto/role.dto';

@ApiTags('角色管理')
@Controller('roles')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Get()
  @ApiOperation({ summary: '获取角色列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRoles(@Query() query: RoleQueryDto) {
    const result = await this.roleService.getRoles(query);
    
    return {
      message: '获取成功',
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取角色详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async getRole(@Param('id', ParseUUIDPipe) id: string) {
    const role = await this.roleService.getRoleById(id);
    
    return {
      message: '获取成功',
      success: true,
      data: role,
    };
  }

  @Post()
  @ApiOperation({ summary: '创建角色' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async createRole(@Body() createRoleDto: CreateRoleDto) {
    const role = await this.roleService.createRole(createRoleDto);
    
    return {
      message: '角色创建成功',
      success: true,
      data: role,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新角色信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  async updateRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    const role = await this.roleService.updateRole(id, updateRoleDto);
    
    return {
      message: '角色信息更新成功',
      success: true,
      data: role,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除角色' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '角色不存在' })
  @ApiResponse({ status: 400, description: '角色正在使用中，无法删除' })
  async deleteRole(@Param('id', ParseUUIDPipe) id: string) {
    await this.roleService.deleteRole(id);
    
    return {
      message: '角色删除成功',
      success: true,
    };
  }

  @Get(':id/users')
  @ApiOperation({ summary: '获取角色下的用户' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getRoleUsers(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const result = await this.roleService.getRoleUsers(id, page, limit);
    
    return {
      message: '获取成功',
      success: true,
      data: result,
    };
  }

  @Get('permissions/available')
  @ApiOperation({ summary: '获取可用权限列表' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getAvailablePermissions() {
    const permissions = await this.roleService.getAvailablePermissions();
    
    return {
      message: '获取成功',
      success: true,
      data: permissions,
    };
  }
}
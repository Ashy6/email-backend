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

import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import {
  CreateUserDto,
  UpdateUserDto,
  UpdateUserStatusDto,
  UserQueryDto,
} from './dto/user.dto';

@ApiTags('用户管理')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: '获取用户列表' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiQuery({ name: 'search', required: false, description: '搜索关键词' })
  @ApiQuery({ name: 'status', required: false, description: '用户状态' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUsers(@Query() query: UserQueryDto) {
    const result = await this.userService.getUsers(query);
    
    return {
      message: '获取成功',
      success: true,
      data: result,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: '获取用户详情' })
  @ApiResponse({ status: 200, description: '获取成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async getUser(@Param('id', ParseUUIDPipe) id: string) {
    const user = await this.userService.getUserById(id);
    
    return {
      message: '获取成功',
      success: true,
      data: user,
    };
  }

  @Post()
  @ApiOperation({ summary: '创建用户' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 400, description: '参数错误' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    
    return {
      message: '用户创建成功',
      success: true,
      data: user,
    };
  }

  @Put(':id')
  @ApiOperation({ summary: '更新用户信息' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const user = await this.userService.updateUser(id, updateUserDto);
    
    return {
      message: '用户信息更新成功',
      success: true,
      data: user,
    };
  }

  @Put(':id/status')
  @ApiOperation({ summary: '更新用户状态' })
  @ApiResponse({ status: 200, description: '更新成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async updateUserStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateStatusDto: UpdateUserStatusDto,
  ) {
    const user = await this.userService.updateUserStatus(id, updateStatusDto.status);
    
    return {
      message: '用户状态更新成功',
      success: true,
      data: user,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除用户' })
  @ApiResponse({ status: 200, description: '删除成功' })
  @ApiResponse({ status: 404, description: '用户不存在' })
  async deleteUser(@Param('id', ParseUUIDPipe) id: string) {
    await this.userService.deleteUser(id);
    
    return {
      message: '用户删除成功',
      success: true,
    };
  }

  @Get(':id/roles')
  @ApiOperation({ summary: '获取用户角色' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserRoles(@Param('id', ParseUUIDPipe) id: string) {
    const roles = await this.userService.getUserRoles(id);
    
    return {
      message: '获取成功',
      success: true,
      data: roles,
    };
  }

  @Post(':id/roles/:roleId')
  @ApiOperation({ summary: '为用户分配角色' })
  @ApiResponse({ status: 200, description: '分配成功' })
  async assignRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    await this.userService.assignRole(id, roleId);
    
    return {
      message: '角色分配成功',
      success: true,
    };
  }

  @Delete(':id/roles/:roleId')
  @ApiOperation({ summary: '移除用户角色' })
  @ApiResponse({ status: 200, description: '移除成功' })
  async removeRole(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('roleId', ParseUUIDPipe) roleId: string,
  ) {
    await this.userService.removeRole(id, roleId);
    
    return {
      message: '角色移除成功',
      success: true,
    };
  }

  @Get(':id/login-logs')
  @ApiOperation({ summary: '获取用户登录日志' })
  @ApiQuery({ name: 'page', required: false, description: '页码' })
  @ApiQuery({ name: 'limit', required: false, description: '每页数量' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getUserLoginLogs(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('page') page = 1,
    @Query('limit') limit = 20,
  ) {
    const logs = await this.userService.getUserLoginLogs(id, page, limit);
    
    return {
      message: '获取成功',
      success: true,
      data: logs,
    };
  }
}
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, In } from 'typeorm';
import * as crypto from 'crypto';

import { Profile } from '../../entities/profile.entity';
import { UserRole } from '../../entities/user-role.entity';
import { LoginLog } from '../../entities/login-log.entity';
import {
  CreateUserDto,
  UpdateUserDto,
  UserQueryDto,
} from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(Profile)
    private profileRepository: Repository<Profile>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
    @InjectRepository(LoginLog)
    private loginLogRepository: Repository<LoginLog>,
  ) {}

  async getUsers(query: UserQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      status,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.profileRepository
      .createQueryBuilder('profile')
      .leftJoinAndSelect('profile.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role');

    // 搜索条件
    if (search) {
      queryBuilder.where(
        '(profile.full_name ILIKE :search OR profile.phone ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 状态筛选
    if (status) {
      queryBuilder.andWhere('profile.status = :status', { status });
    }

    // 排序
    queryBuilder.orderBy(`profile.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // 分页
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserById(id: string): Promise<Profile> {
    const user = await this.profileRepository.findOne({
      where: { id },
      relations: ['userRoles', 'userRoles.role'],
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<Profile> {
    // 检查是否已存在相同的用户
    const existingUser = await this.profileRepository.findOne({
      where: [
        { user_id: createUserDto.email }, // 临时使用email作为user_id
        { phone: createUserDto.phone },
      ].filter(Boolean),
    });

    if (existingUser) {
      throw new ConflictException('用户已存在');
    }

    const user = this.profileRepository.create({
      user_id: crypto.randomUUID(),
      full_name: createUserDto.full_name,
      phone: createUserDto.phone,
      avatar_url: createUserDto.avatar_url,
      status: createUserDto.status || 'active',
    });

    return await this.profileRepository.save(user);
  }

  async updateUser(id: string, updateUserDto: UpdateUserDto): Promise<Profile> {
    const user = await this.getUserById(id);

    // 如果更新手机号，检查是否重复
    if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
      const existingUser = await this.profileRepository.findOne({
        where: { phone: updateUserDto.phone },
      });
      
      if (existingUser && existingUser.id !== id) {
        throw new ConflictException('手机号已被使用');
      }
    }

    Object.assign(user, updateUserDto);
    return await this.profileRepository.save(user);
  }

  async updateUserStatus(id: string, status: string): Promise<Profile> {
    const user = await this.getUserById(id);
    user.status = status;
    return await this.profileRepository.save(user);
  }

  async deleteUser(id: string): Promise<void> {
    const user = await this.getUserById(id);
    await this.profileRepository.remove(user);
  }

  async getUserRoles(userId: string) {
    const userRoles = await this.userRoleRepository.find({
      where: { user_id: userId },
      relations: ['role'],
    });

    return userRoles.map(ur => ur.role);
  }

  async assignRole(userId: string, roleId: string): Promise<void> {
    // 检查用户是否存在
    const user = await this.getUserById(userId);
    
    // 检查是否已经分配了该角色
    const existingUserRole = await this.userRoleRepository.findOne({
      where: {
        user_id: user.user_id,
        role_id: roleId,
      },
    });

    if (existingUserRole) {
      throw new ConflictException('用户已拥有该角色');
    }

    const userRole = this.userRoleRepository.create({
      user_id: user.user_id,
      role_id: roleId,
    });

    await this.userRoleRepository.save(userRole);
  }

  async removeRole(userId: string, roleId: string): Promise<void> {
    const user = await this.getUserById(userId);
    
    const userRole = await this.userRoleRepository.findOne({
      where: {
        user_id: user.user_id,
        role_id: roleId,
      },
    });

    if (!userRole) {
      throw new NotFoundException('用户角色关系不存在');
    }

    await this.userRoleRepository.remove(userRole);
  }

  async getUserLoginLogs(userId: string, page = 1, limit = 20) {
    const user = await this.getUserById(userId);
    
    const [logs, total] = await this.loginLogRepository.findAndCount({
      where: { user_id: user.user_id },
      order: { login_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getUserStats() {
    const totalUsers = await this.profileRepository.count();
    const activeUsers = await this.profileRepository.count({
      where: { status: 'active' },
    });
    const inactiveUsers = await this.profileRepository.count({
      where: { status: 'inactive' },
    });
    const suspendedUsers = await this.profileRepository.count({
      where: { status: 'suspended' },
    });

    // 最近7天注册的用户
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentUsers = await this.profileRepository.count({
      where: {
        created_at: MoreThan(sevenDaysAgo),
      },
    });

    return {
      totalUsers,
      activeUsers,
      inactiveUsers,
      suspendedUsers,
      recentUsers,
    };
  }
}
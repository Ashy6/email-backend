import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Role } from '../../entities/role.entity';
import { UserRole } from '../../entities/user-role.entity';
import { CreateRoleDto, UpdateRoleDto, RoleQueryDto } from './dto/role.dto';

@Injectable()
export class RoleService {
  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(UserRole)
    private userRoleRepository: Repository<UserRole>,
  ) {}

  async getRoles(query: RoleQueryDto) {
    const {
      page = 1,
      limit = 20,
      search,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.roleRepository.createQueryBuilder('role');

    // 搜索条件
    if (search) {
      queryBuilder.where(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${search}%` },
      );
    }

    // 排序
    queryBuilder.orderBy(`role.${sortBy}`, sortOrder as 'ASC' | 'DESC');

    // 分页
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [roles, total] = await queryBuilder.getManyAndCount();

    // 为每个角色添加用户数量统计
    const rolesWithStats = await Promise.all(
      roles.map(async (role) => {
        const userCount = await this.userRoleRepository.count({
          where: { role_id: role.id },
        });
        return {
          ...role,
          userCount,
        };
      }),
    );

    return {
      roles: rolesWithStats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getRoleById(id: string): Promise<Role> {
    const role = await this.roleRepository.findOne({
      where: { id },
    });

    if (!role) {
      throw new NotFoundException('角色不存在');
    }

    return role;
  }

  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    // 检查角色名是否已存在
    const existingRole = await this.roleRepository.findOne({
      where: { name: createRoleDto.name },
    });

    if (existingRole) {
      throw new ConflictException('角色名已存在');
    }

    const role = this.roleRepository.create(createRoleDto);
    return await this.roleRepository.save(role);
  }

  async updateRole(id: string, updateRoleDto: UpdateRoleDto): Promise<Role> {
    const role = await this.getRoleById(id);

    // 如果更新角色名，检查是否重复
    if (updateRoleDto.name && updateRoleDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: { name: updateRoleDto.name },
      });
      
      if (existingRole && existingRole.id !== id) {
        throw new ConflictException('角色名已存在');
      }
    }

    Object.assign(role, updateRoleDto);
    return await this.roleRepository.save(role);
  }

  async deleteRole(id: string): Promise<void> {
    const role = await this.getRoleById(id);

    // 检查是否有用户正在使用该角色
    const userCount = await this.userRoleRepository.count({
      where: { role_id: id },
    });

    if (userCount > 0) {
      throw new BadRequestException(
        `无法删除角色，还有 ${userCount} 个用户正在使用该角色`,
      );
    }

    await this.roleRepository.remove(role);
  }

  async getRoleUsers(roleId: string, page = 1, limit = 20) {
    // 先验证角色是否存在
    await this.getRoleById(roleId);

    const queryBuilder = this.userRoleRepository
      .createQueryBuilder('userRole')
      .leftJoinAndSelect('userRole.profile', 'profile')
      .where('userRole.role_id = :roleId', { roleId })
      .orderBy('userRole.assigned_at', 'DESC');

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [userRoles, total] = await queryBuilder.getManyAndCount();

    const users = userRoles.map(ur => ({
      ...ur.profile,
      assigned_at: ur.assigned_at,
    }));

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

  async getAvailablePermissions() {
    // 定义系统中可用的权限
    const permissions = {
      users: {
        name: '用户管理',
        permissions: [
          'users:read',
          'users:create',
          'users:update',
          'users:delete',
          'users:status',
        ],
      },
      roles: {
        name: '角色管理',
        permissions: [
          'roles:read',
          'roles:create',
          'roles:update',
          'roles:delete',
          'roles:assign',
        ],
      },
      settings: {
        name: '系统设置',
        permissions: [
          'settings:read',
          'settings:update',
        ],
      },
      logs: {
        name: '日志管理',
        permissions: [
          'logs:read',
          'logs:export',
        ],
      },
    };

    return permissions;
  }

  async getRoleStats() {
    const totalRoles = await this.roleRepository.count();
    
    // 获取最常用的角色
    const popularRoles = await this.userRoleRepository
      .createQueryBuilder('userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .select('role.id', 'roleId')
      .addSelect('role.name', 'roleName')
      .addSelect('COUNT(userRole.id)', 'userCount')
      .groupBy('role.id')
      .addGroupBy('role.name')
      .orderBy('COUNT(userRole.id)', 'DESC')
      .limit(5)
      .getRawMany();

    return {
      totalRoles,
      popularRoles: popularRoles.map(role => ({
        id: role.roleId,
        name: role.roleName,
        userCount: parseInt(role.userCount, 10),
      })),
    };
  }
}
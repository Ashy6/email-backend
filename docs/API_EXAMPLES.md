# API 使用示例

本文档提供了用户管理系统所有API接口的详细使用示例，包括请求参数、响应格式和错误处理。

## 基本信息

- **Base URL**: `http://localhost:3001/api`
- **Content-Type**: `application/json`
- **认证方式**: Bearer Token (JWT)

## 通用请求头

```http
Content-Type: application/json
Authorization: Bearer <your-jwt-token>
```

## 响应格式

### 成功响应
```json
{
  "success": true,
  "data": {},
  "message": "操作成功"
}
```

### 错误响应
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "错误描述",
    "details": {}
  }
}
```

## 认证相关 API

### 1. 发送验证码

发送邮箱验证码用于登录验证。

**接口地址**: `POST /auth/send-code`

**请求参数**:
```json
{
  "email": "user@example.com"
}
```

**cURL 示例**:
```bash
curl -X POST http://localhost:3001/api/auth/send-code \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com"
  }'
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "message": "验证码已发送到您的邮箱",
    "expiresIn": 300
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "邮箱格式不正确"
  }
}
```

### 2. 用户登录

使用邮箱和验证码进行登录认证。

**接口地址**: `POST /auth/login`

**请求参数**:
```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

**cURL 示例**:
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "code": "123456"
  }'
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-string",
      "email": "user@example.com",
      "fullName": "用户姓名",
      "avatar": "avatar-url",
      "roles": ["user"]
    },
    "expiresIn": 3600
  }
}
```

### 3. 刷新Token

使用刷新令牌获取新的访问令牌。

**接口地址**: `POST /auth/refresh`

**请求参数**:
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**cURL 示例**:
```bash
curl -X POST http://localhost:3001/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }'
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "expiresIn": 3600
  }
}
```

### 4. 获取当前用户信息

获取当前登录用户的详细信息。

**接口地址**: `GET /auth/profile`

**请求头**:
```http
Authorization: Bearer <access-token>
```

**cURL 示例**:
```bash
curl -X GET http://localhost:3001/api/auth/profile \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "fullName": "用户姓名",
    "avatar": "avatar-url",
    "phone": "13800138000",
    "status": "active",
    "roles": [
      {
        "id": "role-uuid",
        "name": "user",
        "description": "普通用户"
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### 5. 用户登出

退出当前用户会话。

**接口地址**: `POST /auth/logout`

**请求头**:
```http
Authorization: Bearer <access-token>
```

**cURL 示例**:
```bash
curl -X POST http://localhost:3001/api/auth/logout \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "message": "退出登录成功"
  }
}
```

## 用户管理 API

### 1. 获取用户列表

获取系统中所有用户的列表，支持分页和搜索。

**接口地址**: `GET /users`

**查询参数**:
- `page`: 页码（默认: 1）
- `limit`: 每页数量（默认: 10）
- `search`: 搜索关键词（可选）
- `status`: 用户状态筛选（可选）
- `role`: 角色筛选（可选）

**cURL 示例**:
```bash
curl -X GET "http://localhost:3001/api/users?page=1&limit=10&search=john" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "uuid-string",
        "email": "john@example.com",
        "fullName": "John Doe",
        "avatar": "avatar-url",
        "phone": "13800138000",
        "status": "active",
        "roles": ["user"],
        "createdAt": "2024-01-01T00:00:00.000Z",
        "lastLoginAt": "2024-01-15T10:30:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 100,
      "totalPages": 10
    }
  }
}
```

### 2. 获取用户详情

根据用户ID获取用户的详细信息。

**接口地址**: `GET /users/:id`

**路径参数**:
- `id`: 用户ID

**cURL 示例**:
```bash
curl -X GET http://localhost:3001/api/users/uuid-string \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "fullName": "用户姓名",
    "avatar": "avatar-url",
    "phone": "13800138000",
    "status": "active",
    "roles": [
      {
        "id": "role-uuid",
        "name": "user",
        "description": "普通用户",
        "permissions": ["read:profile", "update:profile"]
      }
    ],
    "loginHistory": [
      {
        "loginAt": "2024-01-15T10:30:00.000Z",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0..."
      }
    ],
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  }
}
```

### 3. 创建用户

创建新的用户账户。

**接口地址**: `POST /users`

**请求参数**:
```json
{
  "email": "newuser@example.com",
  "fullName": "新用户",
  "phone": "13800138001",
  "roles": ["user"]
}
```

**cURL 示例**:
```bash
curl -X POST http://localhost:3001/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "email": "newuser@example.com",
    "fullName": "新用户",
    "phone": "13800138001",
    "roles": ["user"]
  }'
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": "new-uuid-string",
    "email": "newuser@example.com",
    "fullName": "新用户",
    "phone": "13800138001",
    "status": "active",
    "roles": ["user"],
    "createdAt": "2024-01-16T00:00:00.000Z"
  }
}
```

### 4. 更新用户信息

更新指定用户的信息。

**接口地址**: `PUT /users/:id`

**路径参数**:
- `id`: 用户ID

**请求参数**:
```json
{
  "fullName": "更新后的姓名",
  "phone": "13800138002",
  "avatar": "new-avatar-url"
}
```

**cURL 示例**:
```bash
curl -X PUT http://localhost:3001/api/users/uuid-string \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "fullName": "更新后的姓名",
    "phone": "13800138002"
  }'
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "email": "user@example.com",
    "fullName": "更新后的姓名",
    "phone": "13800138002",
    "avatar": "new-avatar-url",
    "status": "active",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

### 5. 更新用户状态

激活或禁用用户账户。

**接口地址**: `PATCH /users/:id/status`

**路径参数**:
- `id`: 用户ID

**请求参数**:
```json
{
  "status": "inactive"
}
```

**可选状态值**:
- `active`: 激活
- `inactive`: 禁用
- `suspended`: 暂停

**cURL 示例**:
```bash
curl -X PATCH http://localhost:3001/api/users/uuid-string/status \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "status": "inactive"
  }'
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "id": "uuid-string",
    "status": "inactive",
    "updatedAt": "2024-01-16T10:00:00.000Z"
  }
}
```

### 6. 获取用户统计

获取用户相关的统计数据。

**接口地址**: `GET /users/stats`

**cURL 示例**:
```bash
curl -X GET http://localhost:3001/api/users/stats \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "activeUsers": 1180,
    "inactiveUsers": 70,
    "newUsersThisMonth": 45,
    "usersByRole": {
      "admin": 5,
      "user": 1245
    },
    "loginStats": {
      "todayLogins": 320,
      "weeklyLogins": 1850,
      "monthlyLogins": 7200
    }
  }
}
```

## 角色管理 API

### 1. 获取角色列表

获取系统中所有角色的列表。

**接口地址**: `GET /roles`

**cURL 示例**:
```bash
curl -X GET http://localhost:3001/api/roles \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
  "success": true,
  "data": [
    {
      "id": "admin-role-uuid",
      "name": "admin",
      "description": "系统管理员",
      "permissions": [
        "read:users",
        "write:users",
        "delete:users",
        "read:roles",
        "write:roles",
        "read:settings",
        "write:settings"
      ],
      "userCount": 5,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    {
      "id": "user-role-uuid",
      "name": "user",
      "description": "普通用户",
      "permissions": [
        "read:profile",
        "write:profile"
      ],
      "userCount": 1245,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  ]
}
```

### 2. 获取可用角色

获取当前用户可以分配的角色列表。

**接口地址**: `GET /roles/available`

**cURL 示例**:
```bash
curl -X GET http://localhost:3001/api/roles/available \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### 3. 获取权限列表

获取系统中所有可用的权限。

**接口地址**: `GET /roles/permissions`

**cURL 示例**:
```bash
curl -X GET http://localhost:3001/api/roles/permissions \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "key": "read:users",
        "name": "查看用户",
        "description": "查看用户列表和详情"
      },
      {
        "key": "write:users",
        "name": "管理用户",
        "description": "创建、编辑用户信息"
      },
      {
        "key": "delete:users",
        "name": "删除用户",
        "description": "删除用户账户"
      }
    ],
    "roles": [
      {
        "key": "read:roles",
        "name": "查看角色",
        "description": "查看角色列表和权限"
      },
      {
        "key": "write:roles",
        "name": "管理角色",
        "description": "创建、编辑角色和权限"
      }
    ],
    "settings": [
      {
        "key": "read:settings",
        "name": "查看设置",
        "description": "查看系统设置"
      },
      {
        "key": "write:settings",
        "name": "管理设置",
        "description": "修改系统设置"
      }
    ]
  }
}
```

### 4. 创建角色

创建新的角色。

**接口地址**: `POST /roles`

**请求参数**:
```json
{
  "name": "moderator",
  "description": "内容管理员",
  "permissions": [
    "read:users",
    "write:users",
    "read:content",
    "write:content"
  ]
}
```

**cURL 示例**:
```bash
curl -X POST http://localhost:3001/api/roles \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "name": "moderator",
    "description": "内容管理员",
    "permissions": ["read:users", "write:users"]
  }'
```

### 5. 更新角色权限

更新指定角色的权限配置。

**接口地址**: `PUT /roles/:id/permissions`

**路径参数**:
- `id`: 角色ID

**请求参数**:
```json
{
  "permissions": [
    "read:users",
    "write:users",
    "read:content",
    "write:content",
    "delete:content"
  ]
}
```

**cURL 示例**:
```bash
curl -X PUT http://localhost:3001/api/roles/role-uuid/permissions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "permissions": ["read:users", "write:users", "delete:users"]
  }'
```

## 系统设置 API

### 1. 获取系统设置

获取当前系统的配置设置。

**接口地址**: `GET /settings`

**cURL 示例**:
```bash
curl -X GET http://localhost:3001/api/settings \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**成功响应**:
```json
{
  "success": true,
  "data": {
    "system": {
      "siteName": "用户管理系统",
      "siteDescription": "基于React + NestJS的用户管理系统",
      "logo": "logo-url",
      "timezone": "Asia/Shanghai",
      "language": "zh-CN"
    },
    "email": {
      "smtpHost": "smtp.example.com",
      "smtpPort": 587,
      "smtpUser": "noreply@example.com",
      "fromName": "用户管理系统",
      "codeExpiresIn": 300
    },
    "security": {
      "jwtExpiresIn": "1h",
      "refreshTokenExpiresIn": "7d",
      "maxLoginAttempts": 5,
      "lockoutDuration": 900,
      "passwordMinLength": 8
    },
    "features": {
      "enableRegistration": true,
      "enableEmailVerification": true,
      "enableTwoFactor": false,
      "enableAuditLog": true
    }
  }
}
```

### 2. 更新系统设置

更新系统配置设置。

**接口地址**: `PUT /settings`

**请求参数**:
```json
{
  "system": {
    "siteName": "新的系统名称",
    "siteDescription": "更新后的描述"
  },
  "security": {
    "maxLoginAttempts": 3,
    "lockoutDuration": 1800
  }
}
```

**cURL 示例**:
```bash
curl -X PUT http://localhost:3001/api/settings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "system": {
      "siteName": "新的系统名称"
    }
  }'
```

## 错误处理

### 常见错误代码

| 错误代码 | HTTP状态码 | 描述 |
|---------|-----------|------|
| `INVALID_EMAIL` | 400 | 邮箱格式不正确 |
| `INVALID_CODE` | 400 | 验证码无效或已过期 |
| `USER_NOT_FOUND` | 404 | 用户不存在 |
| `UNAUTHORIZED` | 401 | 未授权访问 |
| `FORBIDDEN` | 403 | 权限不足 |
| `TOKEN_EXPIRED` | 401 | Token已过期 |
| `INVALID_TOKEN` | 401 | Token无效 |
| `EMAIL_EXISTS` | 409 | 邮箱已存在 |
| `ROLE_NOT_FOUND` | 404 | 角色不存在 |
| `PERMISSION_DENIED` | 403 | 权限被拒绝 |
| `RATE_LIMIT_EXCEEDED` | 429 | 请求频率超限 |
| `INTERNAL_ERROR` | 500 | 服务器内部错误 |

### 错误响应示例

**验证码错误**:
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CODE",
    "message": "验证码无效或已过期",
    "details": {
      "field": "code",
      "expiresAt": "2024-01-16T10:05:00.000Z"
    }
  }
}
```

**权限不足**:
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "权限不足，无法执行此操作",
    "details": {
      "requiredPermission": "write:users",
      "userPermissions": ["read:users"]
    }
  }
}
```

**请求频率超限**:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "请求频率超限，请稍后再试",
    "details": {
      "retryAfter": 60,
      "limit": 100,
      "remaining": 0
    }
  }
}
```

## JWT 认证说明

### Token 类型

1. **Access Token**: 用于API访问认证，有效期较短（默认1小时）
2. **Refresh Token**: 用于刷新Access Token，有效期较长（默认7天）

### 使用流程

1. 用户登录成功后获得Access Token和Refresh Token
2. 在API请求中使用Access Token进行认证
3. 当Access Token过期时，使用Refresh Token获取新的Access Token
4. 如果Refresh Token也过期，需要重新登录

### 权限控制

系统采用基于角色的访问控制（RBAC）模型：

- **用户（User）**: 系统的使用者
- **角色（Role）**: 权限的集合
- **权限（Permission）**: 具体的操作权限

权限格式：`action:resource`
- `action`: 操作类型（read, write, delete等）
- `resource`: 资源类型（users, roles, settings等）

### 安全建议

1. **Token存储**: 建议将Token存储在HttpOnly Cookie中
2. **HTTPS**: 生产环境必须使用HTTPS
3. **Token刷新**: 定期刷新Access Token
4. **权限检查**: 前端和后端都要进行权限验证
5. **日志记录**: 记录所有敏感操作的审计日志

---

更多详细信息请参考 [技术架构文档](技术架构文档.md)。
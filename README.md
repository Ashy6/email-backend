# Email Backend - 用户管理系统

基于React + NestJS的现代化用户管理系统，支持邮箱验证码登录、角色权限管理和系统设置。

## ✨ 核心特性

### 🔐 身份认证
- 邮箱验证码登录（无需密码）
- JWT Token 认证机制
- 自动刷新Token
- 安全的会话管理

### 👥 用户管理
- 用户列表查看和搜索
- 用户信息编辑
- 用户状态管理（激活/禁用）
- 用户统计数据

### 🛡️ 权限控制
- 基于角色的访问控制（RBAC）
- 灵活的权限配置
- 角色管理和分配
- 细粒度权限控制

### ⚙️ 系统设置
- 系统配置管理
- 邮件服务配置
- 安全策略设置
- 系统监控面板

## 🚀 技术栈

### 前端技术
- **React 19** - 现代化UI框架
- **TypeScript 5** - 类型安全
- **Vite 7** - 快速构建工具
- **TailwindCSS 3** - 原子化CSS框架
- **React Router 7** - 路由管理
- **Axios** - HTTP客户端
- **ahooks** - React Hooks库
- **Sonner** - 优雅的通知组件

### 后端技术
- **NestJS 11** - 企业级Node.js框架
- **TypeScript 5** - 类型安全
- **TypeORM** - ORM框架
- **PostgreSQL** - 主数据库
- **Redis** - 缓存和会话存储
- **JWT** - 身份认证
- **Nodemailer** - 邮件服务
- **Swagger** - API文档

## 📁 项目结构

```
email-backend/
├── frontend/                 # React前端应用
│   ├── src/
│   │   ├── components/      # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义Hooks
│   │   ├── services/       # API服务
│   │   ├── types/          # TypeScript类型定义
│   │   └── lib/            # 工具函数
│   ├── package.json
│   └── vite.config.ts
├── backend/                 # NestJS后端应用
│   ├── src/
│   │   ├── auth/           # 认证模块
│   │   ├── users/          # 用户管理模块
│   │   ├── roles/          # 角色管理模块
│   │   ├── settings/       # 系统设置模块
│   │   ├── database/       # 数据库配置
│   │   └── common/         # 公共模块
│   ├── test/               # 测试文件
│   ├── package.json
│   └── .env.example
├── docs/                    # 项目文档
│   ├── API_EXAMPLES.md     # API使用示例
│   └── 技术架构文档.md      # 技术架构说明
├── package.json            # 根目录依赖
├── vercel.json             # Vercel部署配置
└── README.md               # 项目说明
```

## 🚀 快速开始

### 环境要求
- Node.js >= 18.0.0
- PostgreSQL >= 13
- Redis >= 6.0

### 1. 克隆项目
```bash
git clone https://github.com/Ashy6/email-backend.git
cd email-backend
```

### 2. 安装依赖
```bash
# 安装根目录依赖
npm install

# 安装前端依赖
cd frontend && npm install

# 安装后端依赖
cd ../backend && npm install
```

### 3. 环境配置
```bash
# 复制环境变量文件
cp backend/.env.example backend/.env

# 编辑环境变量
vim backend/.env
```

### 4. 数据库设置
```bash
# 创建数据库
createdb your_database_name

# 运行迁移（如果有）
cd backend && npm run migration:run
```

### 5. 启动服务
```bash
# 启动后端服务（端口3001）
cd backend && npm run start:dev

# 启动前端服务（端口3000）
cd frontend && npm run dev
```

### 6. 访问应用
- 前端应用: http://localhost:3000
- 后端API: http://localhost:3001
- API文档: http://localhost:3001/api/docs

## 📚 API 文档

### 认证相关
- `POST /api/auth/send-code` - 发送验证码
- `POST /api/auth/verify-code` - 验证登录
- `POST /api/auth/refresh` - 刷新Token
- `POST /api/auth/logout` - 退出登录

### 用户管理
- `GET /api/users` - 获取用户列表
- `GET /api/users/:id` - 获取用户详情
- `POST /api/users` - 创建用户
- `PUT /api/users/:id` - 更新用户信息
- `DELETE /api/users/:id` - 删除用户

### 角色管理
- `GET /api/roles` - 获取角色列表
- `POST /api/roles` - 创建角色
- `PUT /api/roles/:id` - 更新角色
- `DELETE /api/roles/:id` - 删除角色

详细的API使用示例请查看 [API_EXAMPLES.md](docs/API_EXAMPLES.md)

## 🧪 测试

```bash
# 运行前端测试
cd frontend && npm test

# 运行后端测试
cd backend && npm test

# 运行E2E测试
cd backend && npm run test:e2e

# 生成测试覆盖率报告
cd backend && npm run test:cov
```

## 🚀 部署

### Vercel 部署（推荐）
1. 连接GitHub仓库到Vercel
2. 配置环境变量
3. 自动部署

### Docker 部署
```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d
```

### 传统部署
```bash
# 构建前端
cd frontend && npm run build

# 构建后端
cd backend && npm run build

# 启动生产服务
cd backend && npm run start:prod
```

## 🔧 开发指南

### 代码规范
- 使用 ESLint + Prettier 进行代码格式化
- 遵循 TypeScript 严格模式
- 使用 Conventional Commits 规范

### 提交规范
```bash
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 代码重构
test: 测试相关
chore: 构建过程或辅助工具的变动
```

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 联系方式

如有问题，请通过以下方式联系：
- 提交 GitHub Issue
- 发送邮件至项目维护者

---

⭐ 如果这个项目对你有帮助，请给个星标支持一下！
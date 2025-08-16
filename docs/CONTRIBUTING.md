# 贡献指南

感谢您对用户管理系统项目的关注！我们欢迎所有形式的贡献，包括但不限于代码贡献、文档改进、问题报告和功能建议。

## 目录

- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [开发流程](#开发流程)
- [代码规范](#代码规范)
- [提交规范](#提交规范)
- [测试指南](#测试指南)
- [文档贡献](#文档贡献)
- [问题报告](#问题报告)
- [功能请求](#功能请求)

## 开发环境设置

### 前置要求

- Node.js 18+
- npm 或 yarn
- PostgreSQL 13+
- Redis 6+
- Git

### 本地开发设置

1. **Fork 并克隆仓库**
   ```bash
   git clone https://github.com/your-username/email-backend.git
   cd email-backend
   ```

2. **安装依赖**
   ```bash
   # 后端依赖
   cd backend
   npm install
   
   # 前端依赖
   cd ../frontend
   npm install
   ```

3. **配置环境变量**
   ```bash
   # 后端环境变量
   cp backend/.env.example backend/.env
   
   # 前端环境变量
   cp frontend/.env.example frontend/.env
   
   # 编辑配置文件
   nano backend/.env
   nano frontend/.env
   ```

4. **启动数据库服务**
   ```bash
   # 使用 Docker
   docker-compose up -d postgres redis
   
   # 或者启动本地服务
   sudo systemctl start postgresql
   sudo systemctl start redis
   ```

5. **初始化数据库**
   ```bash
   cd backend
   npm run migration:run
   ```

6. **启动开发服务器**
   ```bash
   # 后端开发服务器
   cd backend
   npm run start:dev
   
   # 前端开发服务器（新终端）
   cd frontend
   npm run dev
   ```

7. **访问应用**
   - 前端: http://localhost:5173
   - 后端 API: http://localhost:3000
   - API 文档: http://localhost:3000/api/docs

## 项目结构

```
email-backend/
├── backend/                 # 后端 NestJS 应用
│   ├── src/
│   │   ├── modules/        # 业务模块
│   │   ├── entities/       # 数据库实体
│   │   ├── config/         # 配置文件
│   │   └── main.ts         # 应用入口
│   ├── test/               # 测试文件
│   └── package.json
├── frontend/               # 前端 React 应用
│   ├── src/
│   │   ├── components/     # 可复用组件
│   │   ├── pages/          # 页面组件
│   │   ├── hooks/          # 自定义 Hooks
│   │   ├── lib/            # 工具库
│   │   └── types/          # TypeScript 类型
│   └── package.json
├── docs/                   # 项目文档
├── docker-compose.yml      # Docker 编排文件
└── README.md
```

## 开发流程

### 1. 创建功能分支

```bash
# 从 main 分支创建新分支
git checkout main
git pull origin main
git checkout -b feature/your-feature-name
```

### 2. 开发功能

- 遵循代码规范
- 编写测试用例
- 更新相关文档
- 确保代码通过所有测试

### 3. 提交代码

```bash
# 添加文件
git add .

# 提交（遵循提交规范）
git commit -m "feat: add user profile management"

# 推送到远程分支
git push origin feature/your-feature-name
```

### 4. 创建 Pull Request

1. 在 GitHub 上创建 Pull Request
2. 填写详细的描述
3. 关联相关的 Issue
4. 等待代码审查
5. 根据反馈修改代码

## 代码规范

### TypeScript/JavaScript 规范

我们使用 ESLint 和 Prettier 来保持代码风格一致：

```bash
# 检查代码规范
npm run lint

# 自动修复
npm run lint:fix

# 格式化代码
npm run format
```

### 命名规范

- **文件名**: 使用 kebab-case（如：`user-profile.service.ts`）
- **类名**: 使用 PascalCase（如：`UserProfileService`）
- **函数名**: 使用 camelCase（如：`getUserProfile`）
- **常量**: 使用 UPPER_SNAKE_CASE（如：`MAX_RETRY_COUNT`）
- **接口**: 使用 PascalCase，以 I 开头（如：`IUserProfile`）

### 代码组织

#### 后端模块结构

```typescript
// module.ts
@Module({
  imports: [TypeOrmModule.forFeature([Entity])],
  controllers: [Controller],
  providers: [Service],
  exports: [Service],
})
export class FeatureModule {}

// controller.ts
@Controller('endpoint')
export class FeatureController {
  constructor(private readonly service: FeatureService) {}
  
  @Get()
  async getAll() {
    return this.service.findAll();
  }
}

// service.ts
@Injectable()
export class FeatureService {
  constructor(
    @InjectRepository(Entity)
    private repository: Repository<Entity>,
  ) {}
  
  async findAll() {
    return this.repository.find();
  }
}
```

#### 前端组件结构

```typescript
// Component.tsx
import React from 'react';
import { useHook } from '@/hooks/useHook';
import type { ComponentProps } from '@/types';

interface Props {
  // 定义 props 类型
}

export default function Component({ prop }: Props) {
  const { data, loading } = useHook();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="component-container">
      {/* 组件内容 */}
    </div>
  );
}
```

## 提交规范

我们使用 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

### 提交类型

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

### 提交格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 示例

```bash
# 新功能
git commit -m "feat(auth): add email verification"

# 修复 bug
git commit -m "fix(user): resolve profile update issue"

# 文档更新
git commit -m "docs: update API documentation"

# 重大变更
git commit -m "feat!: change user authentication method

BREAKING CHANGE: JWT token format has changed"
```

## 测试指南

### 后端测试

```bash
# 运行所有测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:cov

# 运行 e2e 测试
npm run test:e2e

# 监听模式运行测试
npm run test:watch
```

#### 单元测试示例

```typescript
// user.service.spec.ts
import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

describe('UserService', () => {
  let service: UserService;
  let mockRepository: any;

  beforeEach(async () => {
    mockRepository = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      remove: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users = [{ id: '1', email: 'test@example.com' }];
      mockRepository.find.mockResolvedValue(users);

      const result = await service.findAll();
      expect(result).toEqual(users);
      expect(mockRepository.find).toHaveBeenCalled();
    });
  });
});
```

### 前端测试

```bash
# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage
```

#### 组件测试示例

```typescript
// Component.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import Component from './Component';

describe('Component', () => {
  it('renders correctly', () => {
    render(<Component />);
    expect(screen.getByText('Expected Text')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Component onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## 文档贡献

### 文档类型

- **API 文档**: 使用 Swagger/OpenAPI 自动生成
- **用户文档**: Markdown 格式，存放在 `docs/` 目录
- **代码注释**: JSDoc 格式

### 文档规范

```typescript
/**
 * 获取用户资料信息
 * @param userId 用户ID
 * @returns 用户资料对象
 * @throws {NotFoundException} 当用户不存在时抛出
 * @example
 * ```typescript
 * const profile = await getUserProfile('123');
 * console.log(profile.email);
 * ```
 */
async getUserProfile(userId: string): Promise<UserProfile> {
  // 实现代码
}
```

## 问题报告

在报告问题时，请提供以下信息：

### Bug 报告模板

```markdown
## Bug 描述
简要描述遇到的问题

## 复现步骤
1. 进入页面 '...'
2. 点击按钮 '...'
3. 滚动到 '...'
4. 看到错误

## 期望行为
描述您期望发生的情况

## 实际行为
描述实际发生的情况

## 截图
如果适用，添加截图来帮助解释问题

## 环境信息
- 操作系统: [例如 macOS 12.0]
- 浏览器: [例如 Chrome 95.0]
- Node.js 版本: [例如 18.0.0]
- 项目版本: [例如 1.0.0]

## 附加信息
添加任何其他相关信息
```

## 功能请求

### 功能请求模板

```markdown
## 功能描述
简要描述您希望添加的功能

## 问题背景
描述这个功能要解决的问题

## 解决方案
描述您希望的解决方案

## 替代方案
描述您考虑过的其他解决方案

## 附加信息
添加任何其他相关信息或截图
```

## 代码审查

### 审查清单

- [ ] 代码符合项目规范
- [ ] 包含适当的测试
- [ ] 文档已更新
- [ ] 没有引入安全漏洞
- [ ] 性能影响可接受
- [ ] 向后兼容性
- [ ] 错误处理完善

### 审查指南

1. **功能性**: 代码是否按预期工作？
2. **可读性**: 代码是否易于理解？
3. **可维护性**: 代码是否易于修改和扩展？
4. **性能**: 是否有性能问题？
5. **安全性**: 是否存在安全漏洞？
6. **测试**: 测试覆盖率是否足够？

## 发布流程

### 版本号规范

我们使用 [Semantic Versioning](https://semver.org/)：

- `MAJOR`: 不兼容的 API 变更
- `MINOR`: 向后兼容的功能新增
- `PATCH`: 向后兼容的问题修复

### 发布步骤

1. 更新版本号
2. 更新 CHANGELOG.md
3. 创建 release 分支
4. 运行完整测试套件
5. 创建 Git tag
6. 发布到生产环境
7. 创建 GitHub Release

## 社区准则

### 行为准则

- 尊重所有参与者
- 欢迎新手和经验丰富的开发者
- 建设性地提供反馈
- 专注于对项目最有利的事情
- 展现同理心

### 沟通渠道

- **GitHub Issues**: 问题报告和功能请求
- **GitHub Discussions**: 一般讨论和问答
- **Pull Requests**: 代码审查和讨论

## 致谢

感谢所有为这个项目做出贡献的开发者！您的贡献让这个项目变得更好。

---

如果您有任何问题或建议，请随时通过 GitHub Issues 联系我们。
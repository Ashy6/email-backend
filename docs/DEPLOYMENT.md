# 部署指南

本文档提供了用户管理系统的详细部署指南，包括 Docker 部署、传统部署和云平台部署等多种方式。

## 目录

- [环境要求](#环境要求)
- [Docker 部署（推荐）](#docker-部署推荐)
- [传统部署](#传统部署)
- [云平台部署](#云平台部署)
- [环境变量配置](#环境变量配置)
- [数据库配置](#数据库配置)
- [SSL/HTTPS 配置](#sslhttps-配置)
- [监控和日志](#监控和日志)
- [故障排除](#故障排除)

## 环境要求

### 最低要求
- **CPU**: 1 核心
- **内存**: 2GB RAM
- **存储**: 10GB 可用空间
- **网络**: 稳定的互联网连接

### 推荐配置
- **CPU**: 2+ 核心
- **内存**: 4GB+ RAM
- **存储**: 20GB+ SSD
- **网络**: 高速互联网连接

### 软件要求
- **Docker**: 20.10+
- **Docker Compose**: 2.0+
- **Node.js**: 18+ (传统部署)
- **PostgreSQL**: 13+ (传统部署)
- **Redis**: 6+ (传统部署)

## Docker 部署（推荐）

### 1. 克隆项目

```bash
git clone https://github.com/your-username/email-backend.git
cd email-backend
```

### 2. 配置环境变量

```bash
# 复制环境变量模板
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# 编辑环境变量
nano backend/.env
nano frontend/.env
```

### 3. 启动服务

```bash
# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 4. 初始化数据库

数据库会在首次启动时自动初始化。如需手动初始化：

```bash
# 进入后端容器
docker-compose exec backend sh

# 运行数据库迁移
npm run migration:run
```

### 5. 访问应用

- **前端应用**: http://localhost:3001
- **后端 API**: http://localhost:3000
- **API 文档**: http://localhost:3000/api/docs

## 传统部署

### 1. 安装依赖

#### 安装 Node.js
```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# CentOS/RHEL
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

#### 安装 PostgreSQL
```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# CentOS/RHEL
sudo yum install -y postgresql-server postgresql-contrib
sudo postgresql-setup initdb
sudo systemctl enable postgresql
sudo systemctl start postgresql
```

#### 安装 Redis
```bash
# Ubuntu/Debian
sudo apt-get install -y redis-server

# CentOS/RHEL
sudo yum install -y redis
sudo systemctl enable redis
sudo systemctl start redis
```

### 2. 配置数据库

```bash
# 切换到 postgres 用户
sudo -u postgres psql

# 创建数据库和用户
CREATE DATABASE email_backend;
CREATE USER email_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE email_backend TO email_user;
\q
```

### 3. 部署后端

```bash
# 进入后端目录
cd backend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env

# 构建应用
npm run build

# 运行数据库迁移
npm run migration:run

# 启动应用
npm run start:prod
```

### 4. 部署前端

```bash
# 进入前端目录
cd frontend

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
nano .env

# 构建应用
npm run build

# 使用 nginx 或其他 web 服务器托管 dist 目录
```

### 5. 配置 Nginx

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端静态文件
    location / {
        root /path/to/frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端 API 代理
    location /api/ {
        proxy_pass http://localhost:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## 云平台部署

### Vercel 部署（前端）

1. 将代码推送到 GitHub
2. 在 Vercel 中导入项目
3. 设置构建配置：
   - **Framework Preset**: Vite
   - **Root Directory**: frontend
   - **Build Command**: npm run build
   - **Output Directory**: dist
4. 配置环境变量
5. 部署

### Railway 部署（后端）

1. 在 Railway 中创建新项目
2. 连接 GitHub 仓库
3. 设置服务配置：
   - **Root Directory**: backend
   - **Build Command**: npm run build
   - **Start Command**: npm run start:prod
4. 添加 PostgreSQL 和 Redis 插件
5. 配置环境变量
6. 部署

### AWS 部署

#### 使用 ECS + RDS + ElastiCache

1. **创建 RDS PostgreSQL 实例**
2. **创建 ElastiCache Redis 集群**
3. **构建 Docker 镜像并推送到 ECR**
4. **创建 ECS 任务定义和服务**
5. **配置 Application Load Balancer**
6. **设置 CloudFront 分发前端静态文件**

## 环境变量配置

### 后端环境变量

```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/email_backend
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=username
DB_PASSWORD=password
DB_DATABASE=email_backend

# Redis配置
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-here
JWT_EXPIRES_IN=24h
REFRESH_TOKEN_SECRET=your-super-secret-refresh-token-key-here
REFRESH_TOKEN_EXPIRES_IN=30d

# 邮件配置
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM="用户管理系统" <noreply@example.com>

# 应用配置
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://your-frontend-domain.com
```

### 前端环境变量

```bash
# Supabase配置
VITE_SUPABASE_URL=your-supabase-project-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# API配置
VITE_API_URL=https://your-api-domain.com/api/v1

# 应用配置
VITE_APP_NAME=用户管理系统
VITE_APP_DESCRIPTION=基于 React + NestJS 的现代化用户管理系统
```

## 数据库配置

### PostgreSQL 优化

```sql
-- 性能优化配置
ALTER SYSTEM SET shared_buffers = '256MB';
ALTER SYSTEM SET effective_cache_size = '1GB';
ALTER SYSTEM SET maintenance_work_mem = '64MB';
ALTER SYSTEM SET checkpoint_completion_target = 0.9;
ALTER SYSTEM SET wal_buffers = '16MB';
ALTER SYSTEM SET default_statistics_target = 100;
ALTER SYSTEM SET random_page_cost = 1.1;
ALTER SYSTEM SET effective_io_concurrency = 200;

-- 重新加载配置
SELECT pg_reload_conf();
```

### 备份策略

```bash
#!/bin/bash
# 数据库备份脚本

BACKUP_DIR="/backups"
DATE=$(date +"%Y%m%d_%H%M%S")
DB_NAME="email_backend"

# 创建备份目录
mkdir -p $BACKUP_DIR

# 执行备份
pg_dump -h localhost -U email_user -d $DB_NAME > $BACKUP_DIR/backup_$DATE.sql

# 压缩备份文件
gzip $BACKUP_DIR/backup_$DATE.sql

# 删除7天前的备份
find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete

echo "备份完成: backup_$DATE.sql.gz"
```

## SSL/HTTPS 配置

### 使用 Let's Encrypt

```bash
# 安装 Certbot
sudo apt-get install certbot python3-certbot-nginx

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo crontab -e
# 添加以下行
0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL 配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;
    
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    
    # 其他配置...
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

## 监控和日志

### 使用 PM2 管理 Node.js 进程

```bash
# 安装 PM2
npm install -g pm2

# 创建 PM2 配置文件
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'email-backend-api',
    script: 'dist/main.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    log_file: './logs/combined.log',
    out_file: './logs/out.log',
    error_file: './logs/error.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
EOF

# 启动应用
pm2 start ecosystem.config.js

# 保存 PM2 配置
pm2 save
pm2 startup
```

### 日志轮转

```bash
# 安装 PM2 日志轮转
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 30
pm2 set pm2-logrotate:compress true
```

### 健康检查

```bash
#!/bin/bash
# 健康检查脚本

API_URL="http://localhost:3000/api/v1/health"
RESPONSE=$(curl -s -o /dev/null -w "%{http_code}" $API_URL)

if [ $RESPONSE -eq 200 ]; then
    echo "API 健康检查通过"
    exit 0
else
    echo "API 健康检查失败，状态码: $RESPONSE"
    # 可以在这里添加重启逻辑
    # pm2 restart email-backend-api
    exit 1
fi
```

## 故障排除

### 常见问题

#### 1. 数据库连接失败
```bash
# 检查数据库状态
sudo systemctl status postgresql

# 检查连接
psql -h localhost -U email_user -d email_backend

# 查看数据库日志
sudo tail -f /var/log/postgresql/postgresql-*.log
```

#### 2. Redis 连接失败
```bash
# 检查 Redis 状态
sudo systemctl status redis

# 测试连接
redis-cli ping

# 查看 Redis 日志
sudo tail -f /var/log/redis/redis-server.log
```

#### 3. 邮件发送失败
```bash
# 检查 SMTP 配置
telnet smtp.gmail.com 587

# 测试邮件发送
node -e "console.log('测试邮件配置')"
```

#### 4. 前端无法访问 API
```bash
# 检查 CORS 配置
curl -H "Origin: http://localhost:3001" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     http://localhost:3000/api/v1/auth/profile
```

### 性能优化

#### 1. 数据库查询优化
```sql
-- 分析慢查询
SELECT query, mean_time, calls 
FROM pg_stat_statements 
ORDER BY mean_time DESC 
LIMIT 10;

-- 创建必要的索引
CREATE INDEX CONCURRENTLY idx_profiles_email_status 
ON profiles(email, status) 
WHERE status = 'active';
```

#### 2. Redis 缓存优化
```bash
# 监控 Redis 性能
redis-cli --latency-history -i 1

# 查看内存使用
redis-cli info memory
```

#### 3. 应用性能监控
```javascript
// 添加性能监控中间件
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.path} - ${duration}ms`);
  });
  next();
});
```

## 安全建议

1. **定期更新依赖包**
2. **使用强密码和密钥**
3. **启用防火墙**
4. **定期备份数据**
5. **监控异常访问**
6. **使用 HTTPS**
7. **限制数据库访问**
8. **定期安全审计**

## 支持

如果在部署过程中遇到问题，请：

1. 查看相关日志文件
2. 检查环境变量配置
3. 确认服务状态
4. 参考故障排除部分
5. 提交 Issue 到 GitHub 仓库

---

更多详细信息请参考项目文档或联系技术支持团队。
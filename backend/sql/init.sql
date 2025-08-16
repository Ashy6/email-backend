-- 创建数据库扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 创建用户资料表
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    full_name VARCHAR(100),
    avatar_url TEXT,
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    email_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建角色表
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建用户角色关联表
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES profiles(user_id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, role_id)
);

-- 创建登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(user_id) ON DELETE SET NULL,
    email VARCHAR(255) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) NOT NULL CHECK (status IN ('success', 'failed', 'blocked')),
    failure_reason VARCHAR(255),
    login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建系统设置表
CREATE TABLE IF NOT EXISTS settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key VARCHAR(255) NOT NULL UNIQUE,
    value JSONB NOT NULL DEFAULT '{}',
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_status ON profiles(status);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);
CREATE INDEX IF NOT EXISTS idx_roles_created_at ON roles(created_at);

CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_assigned_at ON user_roles(assigned_at);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_email ON login_logs(email);
CREATE INDEX IF NOT EXISTS idx_login_logs_status ON login_logs(status);
CREATE INDEX IF NOT EXISTS idx_login_logs_login_at ON login_logs(login_at);
CREATE INDEX IF NOT EXISTS idx_login_logs_ip_address ON login_logs(ip_address);

CREATE INDEX IF NOT EXISTS idx_settings_key ON settings(key);
CREATE INDEX IF NOT EXISTS idx_settings_updated_at ON settings(updated_at);

-- 创建更新时间触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为需要的表创建更新时间触发器
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at BEFORE UPDATE ON roles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 插入默认角色
INSERT INTO roles (name, description, permissions) VALUES 
('超级管理员', '系统超级管理员，拥有所有权限', '{
  "users": ["users:read", "users:create", "users:update", "users:delete", "users:status"],
  "roles": ["roles:read", "roles:create", "roles:update", "roles:delete", "roles:assign"],
  "settings": ["settings:read", "settings:update"],
  "logs": ["logs:read", "logs:export"]
}'),
('管理员', '系统管理员，拥有大部分管理权限', '{
  "users": ["users:read", "users:create", "users:update", "users:status"],
  "roles": ["roles:read", "roles:assign"],
  "settings": ["settings:read"],
  "logs": ["logs:read"]
}'),
('普通用户', '普通用户，只能管理自己的资料', '{
  "profile": ["profile:read", "profile:update"]
}')
ON CONFLICT (name) DO NOTHING;

-- 插入默认系统设置
INSERT INTO settings (key, value, description) VALUES 
('system.name', '{"text": "用户管理系统"}', '系统名称'),
('system.description', '{"text": "基于 React + NestJS 的现代化用户管理系统"}', '系统描述'),
('system.version', '{"text": "1.0.0"}', '系统版本'),
('system.timezone', '{"text": "Asia/Shanghai"}', '系统时区'),
('system.language', '{"text": "zh-CN"}', '系统语言'),
('system.logo_url', '{"text": ""}', '系统Logo URL'),
('email.smtp_enabled', '{"boolean": false}', '启用SMTP邮件发送'),
('email.smtp_host', '{"text": ""}', 'SMTP服务器地址'),
('email.smtp_port', '{"number": 587}', 'SMTP端口'),
('email.smtp_secure', '{"boolean": false}', '启用SSL/TLS'),
('email.smtp_user', '{"text": ""}', 'SMTP用户名'),
('email.from_name', '{"text": "用户管理系统"}', '发件人名称'),
('email.from_address', '{"text": "noreply@example.com"}', '发件人邮箱'),
('security.code_expire_minutes', '{"number": 5}', '验证码有效期（分钟）'),
('security.code_rate_limit', '{"number": 5}', '验证码发送频率限制（次/小时）'),
('security.jwt_expire_hours', '{"number": 24}', 'JWT令牌有效期（小时）'),
('security.refresh_token_expire_days', '{"number": 30}', '刷新令牌有效期（天）'),
('security.max_login_attempts', '{"number": 5}', '最大登录尝试次数'),
('security.lockout_duration_minutes', '{"number": 30}', '账户锁定时长（分钟）'),
('features.user_registration', '{"boolean": true}', '允许用户注册'),
('features.email_verification', '{"boolean": true}', '启用邮箱验证'),
('features.avatar_upload', '{"boolean": true}', '允许头像上传'),
('features.dark_mode', '{"boolean": true}', '启用深色模式'),
('features.multi_language', '{"boolean": false}', '启用多语言支持')
ON CONFLICT (key) DO NOTHING;

-- 创建视图：用户统计
CREATE OR REPLACE VIEW user_stats AS
SELECT 
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE status = 'active') as active_users,
    COUNT(*) FILTER (WHERE status = 'inactive') as inactive_users,
    COUNT(*) FILTER (WHERE status = 'suspended') as suspended_users,
    COUNT(*) FILTER (WHERE email_verified = true) as verified_users,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as new_users_30d,
    COUNT(*) FILTER (WHERE created_at >= CURRENT_DATE - INTERVAL '7 days') as new_users_7d
FROM profiles;

-- 创建视图：登录统计
CREATE OR REPLACE VIEW login_stats AS
SELECT 
    COUNT(*) as total_logins,
    COUNT(*) FILTER (WHERE status = 'success') as successful_logins,
    COUNT(*) FILTER (WHERE status = 'failed') as failed_logins,
    COUNT(*) FILTER (WHERE status = 'blocked') as blocked_logins,
    COUNT(*) FILTER (WHERE login_at >= CURRENT_DATE - INTERVAL '24 hours') as logins_24h,
    COUNT(*) FILTER (WHERE login_at >= CURRENT_DATE - INTERVAL '7 days') as logins_7d,
    COUNT(DISTINCT user_id) FILTER (WHERE login_at >= CURRENT_DATE - INTERVAL '24 hours') as active_users_24h
FROM login_logs;

-- 创建函数：清理过期登录日志
CREATE OR REPLACE FUNCTION cleanup_old_login_logs(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM login_logs 
    WHERE login_at < NOW() - INTERVAL '1 day' * days_to_keep;
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- 创建函数：获取用户权限
CREATE OR REPLACE FUNCTION get_user_permissions(p_user_id UUID)
RETURNS JSONB AS $$
DECLARE
    user_permissions JSONB := '{}';
    role_perms JSONB;
BEGIN
    -- 获取用户所有角色的权限
    FOR role_perms IN
        SELECT r.permissions
        FROM user_roles ur
        JOIN roles r ON ur.role_id = r.id
        WHERE ur.user_id = p_user_id
    LOOP
        -- 合并权限
        user_permissions := user_permissions || role_perms;
    END LOOP;
    
    RETURN user_permissions;
END;
$$ LANGUAGE plpgsql;

-- 创建行级安全策略（RLS）示例
-- ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE login_logs ENABLE ROW LEVEL SECURITY;

-- 为普通用户创建策略：只能查看和修改自己的资料
-- CREATE POLICY profiles_user_policy ON profiles
--     FOR ALL TO authenticated
--     USING (user_id = auth.uid());

-- 为管理员创建策略：可以查看所有用户资料
-- CREATE POLICY profiles_admin_policy ON profiles
--     FOR ALL TO authenticated
--     USING (EXISTS (
--         SELECT 1 FROM user_roles ur
--         JOIN roles r ON ur.role_id = r.id
--         WHERE ur.user_id = auth.uid()
--         AND r.name IN ('超级管理员', '管理员')
--     ));

COMMIT;
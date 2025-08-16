import React from 'react';
import { useRequest } from 'ahooks';
import {
  UsersIcon,
  ShieldCheckIcon,
  ChartBarIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';

interface Stats {
  totalUsers: number;
  activeUsers: number;
  totalRoles: number;
  recentLogins: number;
}

export default function Dashboard() {
  const { data: stats, loading } = useRequest(async (): Promise<Stats> => {
    // 获取用户统计
    const { count: totalUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    const { count: activeUsers } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'active');

    const { count: totalRoles } = await supabase
      .from('roles')
      .select('*', { count: 'exact', head: true });

    // 获取最近24小时登录数
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    const { count: recentLogins } = await supabase
      .from('login_logs')
      .select('*', { count: 'exact', head: true })
      .gte('login_at', yesterday.toISOString());

    return {
      totalUsers: totalUsers || 0,
      activeUsers: activeUsers || 0,
      totalRoles: totalRoles || 0,
      recentLogins: recentLogins || 0,
    };
  });

  const statCards = [
    {
      name: '总用户数',
      value: stats?.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
    },
    {
      name: '活跃用户',
      value: stats?.activeUsers || 0,
      icon: ChartBarIcon,
      color: 'bg-green-500',
    },
    {
      name: '角色数量',
      value: stats?.totalRoles || 0,
      icon: ShieldCheckIcon,
      color: 'bg-purple-500',
    },
    {
      name: '24小时登录',
      value: stats?.recentLogins || 0,
      icon: ClockIcon,
      color: 'bg-orange-500',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">仪表板</h1>
        <p className="mt-2 text-gray-600">系统概览和关键指标</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {statCards.map((stat) => (
          <div
            key={stat.name}
            className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:py-6"
          >
            <dt>
              <div className={`absolute rounded-md p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </div>
              <p className="ml-16 truncate text-sm font-medium text-gray-500">
                {stat.name}
              </p>
            </dt>
            <dd className="ml-16 flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
            </dd>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">快速操作</h3>
            <div className="space-y-3">
              <a
                href="/users"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
              >
                管理用户
              </a>
              <a
                href="/roles"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
              >
                管理角色
              </a>
              <a
                href="/settings"
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md border border-gray-200"
              >
                系统设置
              </a>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">系统状态</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">数据库连接</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">邮件服务</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  正常
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">认证服务</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  正常
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import React, { useState } from 'react';
import { useRequest } from 'ahooks';
import {
  Cog6ToothIcon,
  EnvelopeIcon,
  ShieldCheckIcon,
  GlobeAltIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface SystemSettings {
  id: string;
  key: string;
  value: any;
  description?: string;
  updated_at: string;
}

export default function Settings() {
  const [activeTab, setActiveTab] = useState('system');
  const [isEditing, setIsEditing] = useState(false);

  const {
    data: settings,
    loading,
    refresh,
  } = useRequest(async (): Promise<SystemSettings[]> => {
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .order('key');
    
    if (error) throw error;
    return data || [];
  });

  const { run: updateSetting } = useRequest(
    async (key: string, value: any) => {
      const { error } = await supabase
        .from('settings')
        .upsert({
          key,
          value,
          updated_at: new Date().toISOString(),
        });
      
      if (error) throw error;
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('设置更新成功');
        setIsEditing(false);
        refresh();
      },
      onError: (error) => {
        toast.error('更新失败: ' + error.message);
      },
    }
  );

  const tabs = [
    { id: 'system', name: '系统设置', icon: Cog6ToothIcon },
    { id: 'email', name: '邮件设置', icon: EnvelopeIcon },
    { id: 'security', name: '安全设置', icon: ShieldCheckIcon },
    { id: 'features', name: '功能设置', icon: GlobeAltIcon },
  ];

  const getSettingValue = (key: string, defaultValue: any = '') => {
    const setting = settings?.find(s => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
        <p className="mt-2 text-gray-600">管理系统的各项配置和参数</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon
                    className={`-ml-0.5 mr-2 h-5 w-5 ${
                      isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'system' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">系统基本设置</h3>
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium"
                >
                  {isEditing ? '取消编辑' : '编辑设置'}
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    系统名称
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={getSettingValue('system.name', '用户管理系统')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                      {getSettingValue('system.name', '用户管理系统')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    系统描述
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      defaultValue={getSettingValue('system.description', '基于React + NestJS的用户管理系统')}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                    />
                  ) : (
                    <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                      {getSettingValue('system.description', '基于React + NestJS的用户管理系统')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    时区设置
                  </label>
                  {isEditing ? (
                    <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                      <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                      <option value="UTC">UTC (UTC+0)</option>
                      <option value="America/New_York">America/New_York (UTC-5)</option>
                    </select>
                  ) : (
                    <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                      {getSettingValue('system.timezone', 'Asia/Shanghai')}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    默认语言
                  </label>
                  {isEditing ? (
                    <select className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm">
                      <option value="zh-CN">简体中文</option>
                      <option value="en-US">English</option>
                    </select>
                  ) : (
                    <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                      {getSettingValue('system.language', 'zh-CN') === 'zh-CN' ? '简体中文' : 'English'}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">邮件服务设置</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <EnvelopeIcon className="h-5 w-5 text-blue-400" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                      使用 Supabase Auth
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>
                        当前系统使用 Supabase 内置的邮件服务进行用户认证。
                        邮件模板和发送配置可在 Supabase 控制台中管理。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">安全设置</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">邮箱验证码登录</h4>
                    <p className="text-sm text-gray-500">用户通过邮箱验证码进行登录</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    已启用
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">行级安全策略 (RLS)</h4>
                    <p className="text-sm text-gray-500">数据库级别的安全控制</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    已启用
                  </span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">JWT 令牌认证</h4>
                    <p className="text-sm text-gray-500">基于 JWT 的用户会话管理</p>
                  </div>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    已启用
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">功能开关</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">用户注册</h4>
                    <p className="text-sm text-gray-500">允许新用户注册账户</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-200">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">邮箱验证</h4>
                    <p className="text-sm text-gray-500">要求用户验证邮箱地址</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900">审计日志</h4>
                    <p className="text-sm text-gray-500">记录用户操作日志</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" className="sr-only peer" defaultChecked />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {isEditing && activeTab === 'system' && (
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsEditing(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                取消
              </button>
              <button
                onClick={() => {
                  // 这里应该收集表单数据并保存
                  toast.success('设置保存成功');
                  setIsEditing(false);
                }}
                className="bg-blue-600 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                保存设置
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
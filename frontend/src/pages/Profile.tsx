import React, { useState } from 'react';
import { useRequest } from 'ahooks';
import { UserCircleIcon, CameraIcon } from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { useAuth } from '../hooks/useAuth';
import { toast } from 'sonner';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function Profile() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  const {
    data: profile,
    loading,
    refresh,
  } = useRequest(async (): Promise<Profile | null> => {
    if (!user) return null;
    
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .single();
    
    if (error) {
      // 如果没有找到profile，创建一个
      if (error.code === 'PGRST116') {
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: user.id,
              full_name: user.user_metadata?.full_name || '',
              status: 'active',
            },
          ])
          .select()
          .single();
        
        if (createError) throw createError;
        return newProfile;
      }
      throw error;
    }
    
    return data;
  }, {
    refreshDeps: [user],
    ready: !!user,
  });

  const { run: updateProfile, loading: updating } = useRequest(
    async (updates: Partial<Profile>) => {
      if (!profile) return;
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', profile.id);
      
      if (error) throw error;
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('个人信息更新成功');
        setIsEditing(false);
        refresh();
      },
      onError: (error) => {
        toast.error('更新失败: ' + error.message);
      },
    }
  );

  const handleEdit = () => {
    if (profile) {
      setFormData({
        full_name: profile.full_name || '',
        phone: profile.phone || '',
      });
      setIsEditing(true);
    }
  };

  const handleSave = () => {
    updateProfile(formData);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({ full_name: '', phone: '' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center py-12">
        <p className="text-sm text-gray-500">无法加载个人信息</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">个人设置</h1>
        <p className="mt-2 text-gray-600">管理您的个人信息和账户设置</p>
      </div>

      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-medium text-gray-900">基本信息</h2>
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="text-blue-600 hover:text-blue-500 text-sm font-medium"
              >
                编辑
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleSave}
                  disabled={updating}
                  className="text-blue-600 hover:text-blue-500 text-sm font-medium disabled:opacity-50"
                >
                  {updating ? '保存中...' : '保存'}
                </button>
                <button
                  onClick={handleCancel}
                  className="text-gray-600 hover:text-gray-500 text-sm font-medium"
                >
                  取消
                </button>
              </div>
            )}
          </div>

          <div className="space-y-6">
            {/* Avatar */}
            <div className="flex items-center space-x-6">
              <div className="relative">
                {profile.avatar_url ? (
                  <img
                    className="h-20 w-20 rounded-full object-cover"
                    src={profile.avatar_url}
                    alt="头像"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center">
                    <UserCircleIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                {isEditing && (
                  <button className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-md border border-gray-200">
                    <CameraIcon className="h-4 w-4 text-gray-600" />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-sm font-medium text-gray-900">头像</h3>
                <p className="text-sm text-gray-500">JPG, GIF 或 PNG. 最大 1MB.</p>
              </div>
            </div>

            {/* Email (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                邮箱地址
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="block w-full rounded-md border-gray-300 bg-gray-50 text-gray-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">邮箱地址无法修改</p>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                姓名
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="请输入您的姓名"
                />
              ) : (
                <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                  {profile.full_name || '未设置'}
                </div>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                手机号码
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  placeholder="请输入您的手机号码"
                />
              ) : (
                <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                  {profile.phone || '未设置'}
                </div>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                账户状态
              </label>
              <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  profile.status === 'active' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {profile.status === 'active' ? '正常' : '非活跃'}
                </span>
              </div>
            </div>

            {/* Timestamps */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  注册时间
                </label>
                <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                  {new Date(profile.created_at).toLocaleString('zh-CN')}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  最后更新
                </label>
                <div className="block w-full rounded-md border-gray-300 bg-gray-50 px-3 py-2 text-gray-900 sm:text-sm">
                  {new Date(profile.updated_at).toLocaleString('zh-CN')}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Section */}
      <div className="mt-8 bg-white shadow rounded-lg">
        <div className="px-6 py-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">安全设置</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-gray-200">
              <div>
                <h3 className="text-sm font-medium text-gray-900">邮箱验证</h3>
                <p className="text-sm text-gray-500">您的邮箱已通过验证</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                已验证
              </span>
            </div>
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900">登录方式</h3>
                <p className="text-sm text-gray-500">邮箱验证码登录</p>
              </div>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                已启用
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
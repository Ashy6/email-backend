import React, { useState } from 'react';
import { useRequest } from 'ahooks';
import {
  PlusIcon,
  PencilIcon,
  ShieldCheckIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, string[]>;
  created_at: string;
}

export default function Roles() {
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: roles,
    loading,
    refresh,
  } = useRequest(async (): Promise<Role[]> => {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  });

  const { run: createRole } = useRequest(
    async (roleData: Partial<Role>) => {
      const { error } = await supabase
        .from('roles')
        .insert([roleData]);
      
      if (error) throw error;
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('角色创建成功');
        setShowCreateModal(false);
        refresh();
      },
      onError: (error) => {
        toast.error('创建失败: ' + error.message);
      },
    }
  );

  const { run: updateRole } = useRequest(
    async (roleId: string, roleData: Partial<Role>) => {
      const { error } = await supabase
        .from('roles')
        .update(roleData)
        .eq('id', roleId);
      
      if (error) throw error;
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('角色更新成功');
        setEditingRole(null);
        refresh();
      },
      onError: (error) => {
        toast.error('更新失败: ' + error.message);
      },
    }
  );

  const getPermissionCount = (permissions: Record<string, string[]>) => {
    return Object.values(permissions).reduce((total, perms) => total + perms.length, 0);
  };

  const formatPermissions = (permissions: Record<string, string[]>) => {
    return Object.entries(permissions)
      .map(([resource, actions]) => `${resource}: ${actions.join(', ')}`)
      .join('; ');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-2xl font-bold text-gray-900">角色管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理系统中的角色和权限配置
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="h-4 w-4 inline mr-1" />
            创建角色
          </button>
        </div>
      </div>

      {/* Roles grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {roles?.map((role) => (
          <div
            key={role.id}
            className="relative overflow-hidden rounded-lg bg-white px-6 py-6 shadow hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ShieldCheckIcon className="h-8 w-8 text-blue-500" />
              </div>
              <div className="ml-4 flex-1">
                <h3 className="text-lg font-medium text-gray-900">{role.name}</h3>
                <p className="text-sm text-gray-500">{role.description}</p>
              </div>
              <button
                onClick={() => setEditingRole(role)}
                className="text-gray-400 hover:text-gray-600"
              >
                <PencilIcon className="h-5 w-5" />
              </button>
            </div>
            
            <div className="mt-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">权限数量</span>
                <span className="font-medium text-gray-900">
                  {getPermissionCount(role.permissions)}
                </span>
              </div>
              
              <div className="mt-2">
                <p className="text-xs text-gray-500 line-clamp-2">
                  {formatPermissions(role.permissions)}
                </p>
              </div>
              
              <div className="mt-4 text-xs text-gray-400">
                创建于 {new Date(role.created_at).toLocaleDateString('zh-CN')}
              </div>
            </div>
          </div>
        ))}
      </div>

      {roles?.length === 0 && (
        <div className="text-center py-12">
          <ShieldCheckIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">没有角色</h3>
          <p className="mt-1 text-sm text-gray-500">开始创建第一个角色</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" />
              创建角色
            </button>
          </div>
        </div>
      )}

      {/* Create/Edit Modal would go here */}
      {(showCreateModal || editingRole) && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center px-4">
            <div className="fixed inset-0 bg-black bg-opacity-25" onClick={() => {
              setShowCreateModal(false);
              setEditingRole(null);
            }} />
            <div className="relative bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium mb-4">
                {editingRole ? '编辑角色' : '创建角色'}
              </h3>
              <p className="text-sm text-gray-500">
                角色编辑功能正在开发中...
              </p>
              <div className="mt-4 flex justify-end">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingRole(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  关闭
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
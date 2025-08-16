import React, { useState } from 'react';
import { useRequest } from 'ahooks';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  PencilIcon,
  TrashIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

interface User {
  id: string;
  user_id: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  status: 'active' | 'inactive' | 'suspended';
  created_at: string;
  user?: {
    email: string;
  };
}

export default function Users() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const {
    data: users,
    loading,
    refresh,
  } = useRequest(async (): Promise<User[]> => {
    let query = supabase
      .from('profiles')
      .select(`
        *,
        user:auth.users(email)
      `);

    if (statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    if (searchTerm) {
      query = query.or(`full_name.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`);
    }

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }, {
    refreshDeps: [searchTerm, statusFilter],
  });

  const { run: updateUserStatus } = useRequest(
    async (userId: string, status: string) => {
      const { error } = await supabase
        .from('profiles')
        .update({ status })
        .eq('id', userId);
      
      if (error) throw error;
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('用户状态更新成功');
        refresh();
      },
      onError: (error) => {
        toast.error('更新失败: ' + error.message);
      },
    }
  );

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: '活跃', className: 'bg-green-100 text-green-800' },
      inactive: { label: '非活跃', className: 'bg-gray-100 text-gray-800' },
      suspended: { label: '暂停', className: 'bg-red-100 text-red-800' },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
        {config.label}
      </span>
    );
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
          <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
          <p className="mt-2 text-sm text-gray-700">
            管理系统中的所有用户账户
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            className="block rounded-md bg-blue-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
          >
            <PlusIcon className="h-4 w-4 inline mr-1" />
            添加用户
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="mt-6 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            type="text"
            className="block w-full rounded-md border-0 py-1.5 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
            placeholder="搜索用户..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          className="block rounded-md border-0 py-1.5 pl-3 pr-10 text-gray-900 ring-1 ring-inset ring-gray-300 focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">所有状态</option>
          <option value="active">活跃</option>
          <option value="inactive">非活跃</option>
          <option value="suspended">暂停</option>
        </select>
      </div>

      {/* Users table */}
      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
              <table className="min-w-full divide-y divide-gray-300">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      用户
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      联系方式
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      状态
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wide">
                      注册时间
                    </th>
                    <th className="relative px-6 py-3">
                      <span className="sr-only">操作</span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {users?.map((user) => (
                    <tr key={user.id}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            {user.avatar_url ? (
                              <img
                                className="h-10 w-10 rounded-full"
                                src={user.avatar_url}
                                alt=""
                              />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                <span className="text-sm font-medium text-gray-700">
                                  {user.full_name?.charAt(0) || '?'}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.full_name || '未设置姓名'}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.user?.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="text-sm text-gray-900">
                          {user.phone || '未设置'}
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('zh-CN')}
                      </td>
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="text-blue-600 hover:text-blue-900"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <select
                            className="text-xs border-0 bg-transparent text-gray-600 focus:ring-0"
                            value={user.status}
                            onChange={(e) => updateUserStatus(user.id, e.target.value)}
                          >
                            <option value="active">活跃</option>
                            <option value="inactive">非活跃</option>
                            <option value="suspended">暂停</option>
                          </select>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {users?.length === 0 && (
        <div className="text-center py-12">
          <p className="text-sm text-gray-500">没有找到用户</p>
        </div>
      )}
    </div>
  );
}
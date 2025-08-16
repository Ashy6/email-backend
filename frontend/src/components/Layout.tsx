import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useRequest } from 'ahooks';
import {
  HomeIcon,
  UsersIcon,
  ShieldCheckIcon,
  Cog6ToothIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

const navigation = [
  { name: '仪表板', href: '/dashboard', icon: HomeIcon },
  { name: '用户管理', href: '/users', icon: UsersIcon },
  { name: '角色管理', href: '/roles', icon: ShieldCheckIcon },
  { name: '系统设置', href: '/settings', icon: Cog6ToothIcon },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { run: handleLogout } = useRequest(
    async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('退出登录成功');
        navigate('/login');
      },
      onError: (error) => {
        toast.error('退出登录失败: ' + error.message);
      },
    }
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg">
        <div className="flex h-16 items-center justify-center border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-900">用户管理系统</h1>
        </div>
        <nav className="mt-8 px-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <item.icon
                      className={`mr-3 h-5 w-5 flex-shrink-0 ${
                        isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                      }`}
                    />
                    {item.name}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-gray-200 bg-white px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
            <div className="flex flex-1"></div>
            <div className="flex items-center gap-x-4 lg:gap-x-6">
              {/* Profile dropdown */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center gap-x-2 rounded-full bg-gray-50 p-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => navigate('/profile')}
                >
                  <UserCircleIcon className="h-6 w-6" />
                  <span className="hidden lg:block">个人设置</span>
                </button>
              </div>
              <button
                type="button"
                className="flex items-center gap-x-2 rounded-md bg-red-50 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-100"
                onClick={handleLogout}
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4" />
                退出登录
              </button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-10">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
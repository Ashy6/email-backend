import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useRequest } from 'ahooks';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

export default function Login() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const { run: sendOTP, loading: sendingOTP } = useRequest(
    async () => {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        },
      });
      if (error) throw error;
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('验证码已发送到您的邮箱');
        setStep('otp');
      },
      onError: (error) => {
        toast.error('发送验证码失败: ' + error.message);
      },
    }
  );

  const { run: verifyOTP, loading: verifyingOTP } = useRequest(
    async () => {
      const { error } = await supabase.auth.verifyOtp({
        email,
        token: otp,
        type: 'email',
      });
      if (error) throw error;
    },
    {
      manual: true,
      onSuccess: () => {
        toast.success('登录成功');
        navigate(from, { replace: true });
      },
      onError: (error) => {
        toast.error('验证失败: ' + error.message);
      },
    }
  );

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error('请输入邮箱地址');
      return;
    }
    sendOTP();
  };

  const handleOTPSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      toast.error('请输入验证码');
      return;
    }
    verifyOTP();
  };

  const handleBack = () => {
    setStep('email');
    setOtp('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 'email' ? '登录到您的账户' : '输入验证码'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {step === 'email'
              ? '我们将向您的邮箱发送验证码'
              : `验证码已发送到 ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <form className="mt-8 space-y-6" onSubmit={handleEmailSubmit}>
            <div>
              <label htmlFor="email" className="sr-only">
                邮箱地址
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="邮箱地址"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={sendingOTP}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendingOTP ? '发送中...' : '发送验证码'}
              </button>
            </div>
          </form>
        ) : (
          <form className="mt-8 space-y-6" onSubmit={handleOTPSubmit}>
            <div>
              <label htmlFor="otp" className="sr-only">
                验证码
              </label>
              <input
                id="otp"
                name="otp"
                type="text"
                autoComplete="one-time-code"
                required
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              />
            </div>

            <div className="flex space-x-4">
              <button
                type="button"
                onClick={handleBack}
                className="group relative w-full flex justify-center py-2 px-4 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                返回
              </button>
              <button
                type="submit"
                disabled={verifyingOTP}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingOTP ? '验证中...' : '验证登录'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
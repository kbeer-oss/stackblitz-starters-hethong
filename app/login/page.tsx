'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  getCurrentUser,
  loginWithPassword,
  requestPasswordReset,
} from '@/lib/auth-storage';

export default function LoginPage() {
  const router = useRouter();

  const [mode, setMode] = useState<'login' | 'reset'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [errorText, setErrorText] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const check = async () => {
      try {
        const user = await getCurrentUser();
        if (user) {
          router.replace('/dashboard');
        }
      } catch {
        // bỏ qua
      }
    };

    check();
  }, [router]);

  const handleLogin = async () => {
    setLoading(true);
    setErrorText("");
    setMessage("");
  
    try {
      const result = await loginWithPassword(email, password);
  
      if (!result?.user && !result?.session) {
        throw new Error("Đăng nhập thất bại");
      }
  
      window.location.href = "/dashboard";
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : "Đăng nhập thất bại"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setLoading(true);
    setErrorText('');
    setMessage('');

    try {
      await requestPasswordReset(email);
      setMessage('Đã gửi email đặt lại mật khẩu. Anh kiểm tra mail nhé.');
    } catch (error) {
      setErrorText(
        error instanceof Error ? error.message : 'Gửi email thất bại'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#e8f7f2]">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="w-full max-w-[720px] rounded-[32px] bg-white p-8 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
          <div className="mb-8 flex items-center justify-center gap-3">
            <div className="relative h-14 w-14">
              <span className="absolute left-0 top-0 h-14 w-14 rounded-full bg-emerald-400/80" />
              <span className="absolute left-4 top-0 h-14 w-14 rounded-full bg-cyan-400/70" />
            </div>

            <div>
              <p className="text-3xl font-black tracking-tight text-slate-800">
                Hệ thống quản lý
              </p>
              <p className="text-3xl font-black tracking-tight text-emerald-500">
                Cá Nhân
              </p>
            </div>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6">
            <h1 className="text-2xl font-bold text-slate-800">
              {mode === 'login' ? 'Đăng nhập portal cá nhân' : 'Quên mật khẩu'}
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              {mode === 'login'
                ? 'Đăng nhập bằng tài khoản Supabase thật'
                : 'Nhập email để nhận link đặt lại mật khẩu'}
            </p>

            <div className="mt-6 space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-base outline-none focus:border-emerald-500"
              />

              {mode === 'login' && (
                <input
                  type="password"
                  placeholder="Mật khẩu"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-5 py-4 text-base outline-none focus:border-emerald-500"
                />
              )}
            </div>

            {errorText && (
              <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {errorText}
              </div>
            )}

            {message && (
              <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                {message}
              </div>
            )}

            <div className="mt-6 flex flex-col gap-3">
              {mode === 'login' ? (
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={loading}
                  className="rounded-full bg-emerald-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={loading}
                  className="rounded-full bg-emerald-500 px-6 py-4 text-lg font-bold text-white transition hover:bg-emerald-600 disabled:opacity-60"
                >
                  {loading ? 'Đang gửi...' : 'Gửi email đặt lại mật khẩu'}
                </button>
              )}

              <button
                type="button"
                onClick={() =>
                  setMode((prev) => (prev === 'login' ? 'reset' : 'login'))
                }
                className="text-sm font-medium text-slate-500 hover:text-slate-800"
              >
                {mode === 'login' ? 'Quên mật khẩu?' : 'Quay lại đăng nhập'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

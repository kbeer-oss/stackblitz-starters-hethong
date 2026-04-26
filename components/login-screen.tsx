'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginScreen() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/login');
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#e8f7f2]">
      <div className="rounded-2xl bg-white px-6 py-4 text-sm text-slate-600 shadow-sm ring-1 ring-slate-200">
        Đang chuyển tới trang đăng nhập...
      </div>
    </main>
  );
}

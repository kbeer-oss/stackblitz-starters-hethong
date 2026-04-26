'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function PortalAuthGuard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user && pathname !== '/login' && pathname !== '/update-password') {
        router.replace('/login');
        return;
      }

      if (user && pathname === '/login') {
        router.replace('/dashboard');
        return;
      }

      setLoading(false);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pathname, router]);

  if (loading && pathname !== '/login') {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
          Đang kiểm tra đăng nhập...
        </div>
      </main>
    );
  }

  return <>{children}</>;
}

'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalAuthGuard from '@/components/portal-auth-guard';
import { logout } from '@/lib/auth-storage';
import SidebarBrand from '@/components/sidebar-brand';
import SidebarMenu from '@/components/sidebar-menu';
import UserAvatar from '@/components/user-avatar';
import {
  getPortalData,
  type PortalData,
  type TaskItem,
} from '@/lib/portal-storage';

function parseDateOnly(value: string) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isTodayTask(task: TaskItem) {
  const due = parseDateOnly(task.dueDate);
  if (!due) return false;
  return due.getTime() === getTodayDate().getTime();
}

function isOverdueTask(task: TaskItem) {
  if (task.status === 'Hoàn thành') return false;
  const due = parseDateOnly(task.dueDate);
  if (!due) return false;
  return due.getTime() < getTodayDate().getTime();
}

function isUpcomingTask(task: TaskItem) {
  if (task.status === 'Hoàn thành') return false;
  const due = parseDateOnly(task.dueDate);
  if (!due) return false;

  const diff = due.getTime() - getTodayDate().getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  return diffDays > 0 && diffDays <= 7;
}

function sortByDate(a: TaskItem, b: TaskItem) {
  const aDate = parseDateOnly(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  const bDate = parseDateOnly(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
  return aDate - bDate;
}

export default function SchedulePage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);

  useEffect(() => {
    const load = () => setData(getPortalData());

    load();
    window.addEventListener('portal-data-change', load);
    window.addEventListener('focus', load);

    return () => {
      window.removeEventListener('portal-data-change', load);
      window.removeEventListener('focus', load);
    };
  }, []);

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const menu = [
    { label: 'Tổng quan', href: '/dashboard' },
    { label: 'Quản lý', href: '/management' },
    { label: 'Báo cáo', href: '/reports' },
    { label: 'Lịch công việc', href: '/schedule' },
    { label: 'Cài đặt', href: '/settings' },
  ];

  const todayTasks = useMemo(() => {
    if (!data) return [];
    return [...data.tasks].filter(isTodayTask).sort(sortByDate);
  }, [data]);

  const upcomingTasks = useMemo(() => {
    if (!data) return [];
    return [...data.tasks].filter(isUpcomingTask).sort(sortByDate);
  }, [data]);

  const overdueTasks = useMemo(() => {
    if (!data) return [];
    return [...data.tasks].filter(isOverdueTask).sort(sortByDate);
  }, [data]);

  if (!data) {
    return (
      <PortalAuthGuard>
        <main className="flex min-h-screen items-center justify-center bg-slate-100">
          <div className="rounded-2xl bg-white px-6 py-4 shadow-sm ring-1 ring-slate-200">
            Đang tải dữ liệu...
          </div>
        </main>
      </PortalAuthGuard>
    );
  }

  return (
    <PortalAuthGuard>
      <main className="min-h-screen bg-slate-100">
        <div className="flex min-h-screen">
          <aside className="w-[250px] bg-slate-900 text-white">
            <SidebarBrand />
            <SidebarMenu items={menu} activeHref="/schedule" />
          </aside>

          <section className="flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Lịch công việc
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Theo dõi việc hôm nay, sắp tới, quá hạn và danh mục link công
                  việc
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handleLogout}
                  className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  Đăng xuất
                </button>

                <div className="text-right">
                  <p className="text-sm font-semibold text-slate-800">
                    {data.profile.displayName}
                  </p>
                  <p className="text-xs text-slate-500">{data.profile.role}</p>
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 font-bold text-white">
                  {data.profile.displayName.slice(0, 1).toUpperCase()}
                </div>
              </div>
            </header>

            <div className="p-8">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Việc hôm nay</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {todayTasks.length}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Sắp tới</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {upcomingTasks.length}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Quá hạn</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {overdueTasks.length}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Link công việc</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {data.workLinks.length}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Việc hôm nay
                  </h2>

                  <div className="mt-4 space-y-3">
                    {todayTasks.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Không có việc hôm nay.
                      </p>
                    ) : (
                      todayTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {task.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            {task.priority} • {task.status}
                          </p>
                          {task.note && (
                            <p className="mt-1 text-xs text-slate-500">
                              {task.note}
                            </p>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Sắp tới
                  </h2>

                  <div className="mt-4 space-y-3">
                    {upcomingTasks.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Không có việc sắp tới.
                      </p>
                    ) : (
                      upcomingTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <p className="text-sm font-semibold text-slate-800">
                            {task.title}
                          </p>
                          <p className="mt-1 text-sm text-slate-600">
                            Deadline: {task.dueDate}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Quá hạn
                  </h2>

                  <div className="mt-4 space-y-3">
                    {overdueTasks.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Không có việc quá hạn.
                      </p>
                    ) : (
                      overdueTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-rose-200 bg-rose-50 p-4"
                        >
                          <p className="text-sm font-semibold text-rose-700">
                            {task.title}
                          </p>
                          <p className="mt-1 text-sm text-rose-600">
                            Deadline: {task.dueDate}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Danh mục Link công việc
                  </h2>

                  <div className="mt-4 overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Tên link
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            URL
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Ghi chú
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Ghim
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Mở
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.workLinks.length === 0 ? (
                          <tr>
                            <td
                              colSpan={5}
                              className="px-4 py-6 text-center text-sm text-slate-500"
                            >
                              Chưa có link công việc nào.
                            </td>
                          </tr>
                        ) : (
                          data.workLinks.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-slate-100 last:border-b-0"
                            >
                              <td className="px-4 py-3 text-sm font-medium text-slate-800">
                                {item.title}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-600">
                                <span className="inline-block max-w-[380px] truncate align-middle">
                                  {item.url}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-500">
                                {item.note || '-'}
                              </td>
                              <td className="px-4 py-3 text-sm">
                                {item.isPinned ? (
                                  <span className="rounded-full bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                                    Đã ghim
                                  </span>
                                ) : (
                                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                    Bình thường
                                  </span>
                                )}
                              </td>
                              <td className="px-4 py-3">
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                                >
                                  Mở link
                                </a>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Ghi chú quan trọng
                  </h2>

                  <div className="mt-4 space-y-3">
                    {data.notes.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Chưa có ghi chú nào.
                      </p>
                    ) : (
                      data.notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700"
                        >
                          {note.text}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  ← Quay về dashboard
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PortalAuthGuard>
  );
}

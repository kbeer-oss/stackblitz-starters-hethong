'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalAuthGuard from '@/components/portal-auth-guard';
import SidebarBrand from '@/components/sidebar-brand';
import SidebarMenu from '@/components/sidebar-menu';
import UserAvatar from '@/components/user-avatar';
import { logout } from '@/lib/auth-storage';
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

function todayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

function isTodayTask(task: TaskItem) {
  const due = parseDateOnly(task.dueDate);
  if (!due) return false;
  return due.getTime() === todayDate().getTime();
}

function isOverdueTask(task: TaskItem) {
  if (task.status === 'Hoàn thành') return false;
  const due = parseDateOnly(task.dueDate);
  if (!due) return false;
  return due.getTime() < todayDate().getTime();
}

function isUpcomingTask(task: TaskItem) {
  if (task.status === 'Hoàn thành') return false;
  const due = parseDateOnly(task.dueDate);
  if (!due) return false;

  const diff = due.getTime() - todayDate().getTime();
  const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24));

  return diffDays > 0 && diffDays <= 7;
}

function taskWeight(task: TaskItem) {
  if (isOverdueTask(task)) return 0;
  if (isTodayTask(task)) return 1;
  if (isUpcomingTask(task)) return 2;
  return 3;
}

export default function DashboardPage() {
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

  const urgentTasks = useMemo(() => {
    if (!data) return [];

    return [...data.tasks]
      .filter(
        (task) =>
          task.isPinned ||
          isOverdueTask(task) ||
          isTodayTask(task) ||
          isUpcomingTask(task)
      )
      .sort((a, b) => {
        const weightDiff = taskWeight(a) - taskWeight(b);
        if (weightDiff !== 0) return weightDiff;
        const aDate =
          parseDateOnly(a.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        const bDate =
          parseDateOnly(b.dueDate)?.getTime() ?? Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      })
      .slice(0, 6);
  }, [data]);

  const todayTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks.filter(isTodayTask).slice(0, 5);
  }, [data]);

  const upcomingTasks = useMemo(() => {
    if (!data) return [];
    return data.tasks.filter(isUpcomingTask).slice(0, 5);
  }, [data]);

  const pinnedLinks = useMemo(() => {
    if (!data) return [];
    const pinned = data.workLinks.filter((item) => item.isPinned);
    return (pinned.length > 0 ? pinned : data.workLinks).slice(0, 5);
  }, [data]);

  const pinnedReports = useMemo(() => {
    if (!data) return [];
    const pinned = data.reports.filter((item) => item.isPinned);
    return (pinned.length > 0 ? pinned : data.reports).slice(0, 5);
  }, [data]);

  const stats = useMemo(() => {
    if (!data) {
      return {
        overdue: 0,
        today: 0,
        upcoming: 0,
        pinnedReports: 0,
      };
    }

    return {
      overdue: data.tasks.filter(isOverdueTask).length,
      today: data.tasks.filter(isTodayTask).length,
      upcoming: data.tasks.filter(isUpcomingTask).length,
      pinnedReports: data.reports.filter((item) => item.isPinned).length,
    };
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
            <SidebarMenu items={menu} activeHref="/dashboard" />
          </aside>

          <section className="flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Dashboard</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Tổng quan việc cần xử lý, deadline gần và báo cáo quan trọng
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

                <UserAvatar
                  name={data.profile.displayName}
                  avatarUrl={data.profile.avatarUrl}
                  size="md"
                />
              </div>
            </header>

            <div className="p-8">
              <div className="grid gap-4 md:grid-cols-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Việc quá hạn</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.overdue}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Việc hôm nay</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.today}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Sắp tới</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.upcoming}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Báo cáo ghim</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.pinnedReports}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Cần xử lý ngay
                    </h2>

                    <Link
                      href="/management"
                      className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                    >
                      Quản lý việc
                    </Link>
                  </div>

                  <div className="mt-4 space-y-3">
                    {urgentTasks.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Chưa có việc cần ưu tiên.
                      </p>
                    ) : (
                      urgentTasks.map((task) => (
                        <div
                          key={task.id}
                          className="rounded-xl border border-slate-200 p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800">
                              {task.title}
                            </p>

                            {task.isPinned && (
                              <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                                Ghim
                              </span>
                            )}

                            {isOverdueTask(task) && (
                              <span className="rounded-full bg-rose-50 px-2 py-1 text-xs font-medium text-rose-700">
                                Quá hạn
                              </span>
                            )}

                            {isTodayTask(task) && !isOverdueTask(task) && (
                              <span className="rounded-full bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700">
                                Hôm nay
                              </span>
                            )}

                            {isUpcomingTask(task) && (
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                                Sắp tới
                              </span>
                            )}
                          </div>

                          <p className="mt-2 text-sm text-slate-600">
                            Ưu tiên: {task.priority} • Trạng thái: {task.status}{' '}
                            • Deadline: {task.dueDate || '-'}
                          </p>

                          {task.note && (
                            <p className="mt-1 text-sm text-slate-500">
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
                    Ghi chú quan trọng
                  </h2>

                  <div className="mt-4 space-y-3">
                    {data.notes.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Chưa có ghi chú nào.
                      </p>
                    ) : (
                      data.notes.slice(0, 4).map((note) => (
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

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Việc hôm nay / Sắp tới
                  </h2>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Hôm nay
                      </p>
                      <div className="space-y-2">
                        {todayTasks.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            Không có việc hôm nay.
                          </p>
                        ) : (
                          todayTasks.map((task) => (
                            <div
                              key={task.id}
                              className="rounded-xl border border-slate-200 p-3"
                            >
                              <p className="text-sm font-medium text-slate-800">
                                {task.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                {task.priority} • {task.status}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Sắp tới
                      </p>
                      <div className="space-y-2">
                        {upcomingTasks.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            Không có việc sắp tới.
                          </p>
                        ) : (
                          upcomingTasks.map((task) => (
                            <div
                              key={task.id}
                              className="rounded-xl border border-slate-200 p-3"
                            >
                              <p className="text-sm font-medium text-slate-800">
                                {task.title}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Deadline: {task.dueDate}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Báo cáo & Link quan trọng
                    </h2>

                    <Link
                      href="/reports"
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Xem báo cáo
                    </Link>
                  </div>

                  <div className="mt-4 space-y-4">
                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Báo cáo quan trọng
                      </p>

                      <div className="space-y-2">
                        {pinnedReports.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            Chưa có báo cáo nào.
                          </p>
                        ) : (
                          pinnedReports.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-xl border border-slate-200 p-3"
                            >
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-medium text-slate-800">
                                  {item.name}
                                </p>

                                {item.isPinned && (
                                  <span className="rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
                                    Ghim
                                  </span>
                                )}
                              </div>

                              <p className="mt-1 text-xs text-slate-500">
                                {item.status} • {item.updated}
                              </p>

                              {item.note && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {item.note}
                                </p>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-sm font-semibold text-slate-700">
                        Link công việc ghim
                      </p>

                      <div className="space-y-2">
                        {pinnedLinks.length === 0 ? (
                          <p className="text-sm text-slate-500">
                            Chưa có link công việc nào.
                          </p>
                        ) : (
                          pinnedLinks.map((item) => (
                            <a
                              key={item.id}
                              href={item.url}
                              target="_blank"
                              rel="noreferrer"
                              className="block rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-emerald-400"
                            >
                              <p className="text-sm font-medium text-slate-800">
                                {item.title}
                              </p>
                              <p className="mt-1 truncate text-xs text-slate-500">
                                {item.url}
                              </p>
                            </a>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PortalAuthGuard>
  );
}

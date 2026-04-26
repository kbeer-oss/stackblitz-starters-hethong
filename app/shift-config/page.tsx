'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalAuthGuard from '@/components/portal-auth-guard';
import SidebarBrand from '@/components/sidebar-brand';
import SidebarMenu from '@/components/sidebar-menu';
import UserAvatar from '@/components/user-avatar';
import { logout } from '@/lib/auth-storage';
import {
  getPortalData,
  savePortalData,
  type PortalData,
  type ShiftChecklistPriority,
} from '@/lib/portal-storage';

export default function ShiftConfigPage() {
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

  const updateData = (nextData: PortalData) => {
    setData(nextData);
    savePortalData(nextData);
  };

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  const menu = [
    { label: 'Tổng quan', href: '/dashboard' },
    { label: 'Quản lý', href: '/management' },
    { label: 'Báo cáo', href: '/reports' },
    { label: 'Lịch công việc', href: '/schedule' },
    { label: 'Lịch Team Quản Lý', href: '/team-schedule' },
    { label: 'Checklist theo Ca', href: '/shift-checklist' },
    { label: 'Cấu hình ca', href: '/shift-config' },
    { label: 'Cài đặt', href: '/settings' },
  ];

  const updateChecklistTemplateItem = (
    shiftCode: string,
    itemId: string,
    patch: {
      attachmentName?: string;
      attachmentUrl?: string;
      priority?: ShiftChecklistPriority;
    }
  ) => {
    if (!data) return;

    updateData({
      ...data,
      shiftChecklists: data.shiftChecklists.map((group) =>
        group.shiftCode === shiftCode
          ? {
              ...group,
              items: group.items.map((item) =>
                item.id === itemId
                  ? {
                      ...item,
                      ...patch,
                    }
                  : item
              ),
            }
          : group
      ),
    });
  };

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
          <aside className="sticky top-0 h-screen w-[280px] shrink-0 overflow-y-auto bg-slate-900 text-white">
            <SidebarBrand />
            <SidebarMenu items={menu} activeHref="/shift-config" />
          </aside>

          <section className="min-w-0 flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Cấu hình ca
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Sửa file đính kèm và mức độ ưu tiên cho từng task
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

            <div className="space-y-6 p-8">
              {data.shiftChecklists.map((group) => (
                <div
                  key={group.shiftCode}
                  className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                >
                  <h2 className="text-2xl font-bold text-slate-800">
                    Cấu hình Ca {group.shiftCode}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Điền link file để phần checklist bấm mở link trực tiếp
                  </p>

                  <div className="mt-5 overflow-x-auto">
                    <table className="min-w-full border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-left">
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Check List
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Task/Công việc
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Tên file đính kèm
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Link file
                          </th>
                          <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                            Mức độ ưu tiên
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {group.items.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                              {item.taskLabel}
                            </td>

                            <td className="px-4 py-3 text-sm font-medium text-slate-800">
                              {item.title}
                            </td>

                            <td className="px-4 py-3">
                              <input
                                value={item.attachmentName}
                                onChange={(e) =>
                                  updateChecklistTemplateItem(
                                    group.shiftCode,
                                    item.id,
                                    {
                                      attachmentName: e.target.value,
                                    }
                                  )
                                }
                                placeholder="Tên file đính kèm"
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <input
                                value={item.attachmentUrl}
                                onChange={(e) =>
                                  updateChecklistTemplateItem(
                                    group.shiftCode,
                                    item.id,
                                    {
                                      attachmentUrl: e.target.value,
                                    }
                                  )
                                }
                                placeholder="https://..."
                                className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                              />
                            </td>

                            <td className="px-4 py-3">
                              <select
                                value={item.priority}
                                onChange={(e) =>
                                  updateChecklistTemplateItem(
                                    group.shiftCode,
                                    item.id,
                                    {
                                      priority: e.target
                                        .value as ShiftChecklistPriority,
                                    }
                                  )
                                }
                                className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-emerald-500"
                              >
                                <option value="Rất cao">Rất cao</option>
                                <option value="Cao">Cao</option>
                                <option value="Trung bình">Trung bình</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </PortalAuthGuard>
  );
}

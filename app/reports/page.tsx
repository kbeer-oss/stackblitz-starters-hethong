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
  savePortalData,
  type PortalData,
  type ReportItem,
  type ReportStatus,
} from '@/lib/portal-storage';

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ReportsPage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Tất cả' | ReportStatus>(
    'Tất cả'
  );

  const [reportForm, setReportForm] = useState({
    name: '',
    status: 'Đang xử lý' as ReportStatus,
    note: '',
  });

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingForm, setEditingForm] = useState<ReportItem | null>(null);

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

  const updateData = (nextData: PortalData) => {
    setData(nextData);
    savePortalData(nextData);
  };

  const addReport = () => {
    if (!data) return;
    if (!reportForm.name.trim()) return;

    const nextData: PortalData = {
      ...data,
      reports: [
        {
          id: createId('rep'),
          name: reportForm.name.trim(),
          owner: data.profile.displayName,
          updated: getCurrentTime(),
          status: reportForm.status,
          note: reportForm.note.trim(),
          isPinned: false,
        },
        ...data.reports,
      ],
    };

    updateData(nextData);
    setReportForm({
      name: '',
      status: 'Đang xử lý',
      note: '',
    });
  };

  const deleteReport = (id: string) => {
    if (!data) return;

    updateData({
      ...data,
      reports: data.reports.filter((item) => item.id !== id),
    });
  };

  const toggleReportPin = (id: string) => {
    if (!data) return;

    updateData({
      ...data,
      reports: data.reports.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      ),
    });
  };

  const startEdit = (item: ReportItem) => {
    setEditingId(item.id);
    setEditingForm({ ...item });
  };

  const saveEdit = () => {
    if (!data || !editingId || !editingForm) return;

    const nextData: PortalData = {
      ...data,
      reports: data.reports.map((item) =>
        item.id === editingId
          ? {
              ...editingForm,
              updated: getCurrentTime(),
            }
          : item
      ),
    };

    updateData(nextData);
    setEditingId(null);
    setEditingForm(null);
  };

  const filteredReports = useMemo(() => {
    if (!data) return [];

    return data.reports.filter((item) => {
      const q = search.trim().toLowerCase();

      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.note.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q);

      const matchStatus =
        statusFilter === 'Tất cả' || item.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, search, statusFilter]);

  const summary = useMemo(() => {
    if (!data) {
      return {
        total: 0,
        done: 0,
        processing: 0,
        pinned: 0,
      };
    }

    return {
      total: data.reports.length,
      done: data.reports.filter((item) => item.status === 'Hoàn thành').length,
      processing: data.reports.filter((item) => item.status !== 'Hoàn thành')
        .length,
      pinned: data.reports.filter((item) => item.isPinned).length,
    };
  }, [data]);

  const getStatusClass = (status: string) => {
    switch (status) {
      case 'Hoàn thành':
        return 'bg-emerald-50 text-emerald-700';
      case 'Đang xử lý':
        return 'bg-amber-50 text-amber-700';
      case 'Chờ duyệt':
        return 'bg-sky-50 text-sky-700';
      default:
        return 'bg-slate-100 text-slate-700';
    }
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
          <aside className="w-[250px] bg-slate-900 text-white">
            <SidebarBrand />
            <SidebarMenu items={menu} activeHref="/reports" />
          </aside>

          <section className="flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Báo cáo</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Thêm, sửa, xóa, tìm kiếm, lọc và ghim báo cáo quan trọng
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
                  <p className="text-sm text-slate-500">Tổng báo cáo</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {summary.total}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Hoàn thành</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {summary.done}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Đang xử lý</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {summary.processing}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Báo cáo ghim</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {summary.pinned}
                  </h2>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <h2 className="text-xl font-semibold text-slate-800">
                  Thêm báo cáo mới
                </h2>

                <div className="mt-4 grid gap-3 md:grid-cols-3">
                  <input
                    value={reportForm.name}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, name: e.target.value })
                    }
                    placeholder="Tên báo cáo"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-2"
                  />

                  <select
                    value={reportForm.status}
                    onChange={(e) =>
                      setReportForm({
                        ...reportForm,
                        status: e.target.value as ReportStatus,
                      })
                    }
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                  >
                    <option value="Đang xử lý">Đang xử lý</option>
                    <option value="Hoàn thành">Hoàn thành</option>
                    <option value="Chờ duyệt">Chờ duyệt</option>
                  </select>

                  <input
                    value={reportForm.note}
                    onChange={(e) =>
                      setReportForm({ ...reportForm, note: e.target.value })
                    }
                    placeholder="Ghi chú"
                    className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-3"
                  />
                </div>

                <button
                  onClick={addReport}
                  className="mt-4 rounded-full bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                >
                  + Lưu báo cáo
                </button>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Danh sách báo cáo
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    <input
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      placeholder="Tìm báo cáo..."
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                    />

                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value as 'Tất cả' | ReportStatus
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="Tất cả">Tất cả trạng thái</option>
                      <option value="Đang xử lý">Đang xử lý</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                      <option value="Chờ duyệt">Chờ duyệt</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Báo cáo
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Người phụ trách
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Cập nhật
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Ghim
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredReports.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-6 text-center text-sm text-slate-500"
                          >
                            Không có báo cáo phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredReports.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-4 py-3 text-sm">
                              {editingId === item.id && editingForm ? (
                                <div className="grid gap-2">
                                  <input
                                    value={editingForm.name}
                                    onChange={(e) =>
                                      setEditingForm({
                                        ...editingForm,
                                        name: e.target.value,
                                      })
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                  />
                                  <input
                                    value={editingForm.note}
                                    onChange={(e) =>
                                      setEditingForm({
                                        ...editingForm,
                                        note: e.target.value,
                                      })
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                    placeholder="Ghi chú"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {item.name}
                                  </p>
                                  {item.note && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {item.note}
                                    </p>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm text-slate-600">
                              {item.owner}
                            </td>

                            <td className="px-4 py-3 text-sm text-slate-600">
                              {item.updated}
                            </td>

                            <td className="px-4 py-3 text-sm">
                              {editingId === item.id && editingForm ? (
                                <select
                                  value={editingForm.status}
                                  onChange={(e) =>
                                    setEditingForm({
                                      ...editingForm,
                                      status: e.target.value as ReportStatus,
                                    })
                                  }
                                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                >
                                  <option value="Đang xử lý">Đang xử lý</option>
                                  <option value="Hoàn thành">Hoàn thành</option>
                                  <option value="Chờ duyệt">Chờ duyệt</option>
                                </select>
                              ) : (
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${getStatusClass(
                                    item.status
                                  )}`}
                                >
                                  {item.status}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleReportPin(item.id)}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  item.isPinned
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {item.isPinned ? 'Đã ghim' : 'Ghim'}
                              </button>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {editingId === item.id ? (
                                  <>
                                    <button
                                      onClick={saveEdit}
                                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingId(null);
                                        setEditingForm(null);
                                      }}
                                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                                    >
                                      Hủy
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEdit(item)}
                                      className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => deleteReport(item.id)}
                                      className="rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                                    >
                                      Xóa
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
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

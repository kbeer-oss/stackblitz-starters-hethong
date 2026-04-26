'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalAuthGuard from '@/components/portal-auth-guard';
import SidebarBrand from '@/components/sidebar-brand';
import SidebarMenu from '@/components/sidebar-menu';
import UserAvatar from '@/components/user-avatar';
import { logout } from '@/lib/auth-storage';
import AdminCreateUserCard from '@/components/admin-create-user-card';
import {
  getPortalData,
  savePortalData,
  type EmployeeGroup,
  type EmployeeProfile,
  type EmployeeWorkStatus,
  type PortalData,
} from '@/lib/portal-storage';

const GROUP_ORDER: EmployeeGroup[] = [
  'CAP',
  'UP CAP',
  'UP CAP TRAINING',
  'UP TRAINING',
  'UP',
  'TRAINING',
  'SENIOR',
];

function calcTenure(joinDate: string) {
  if (!joinDate) return 'Chưa có dữ liệu';

  const start = new Date(`${joinDate}T00:00:00`);
  if (Number.isNaN(start.getTime())) return 'Chưa có dữ liệu';

  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (now.getDate() < start.getDate()) months -= 1;
  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const remainMonths = months % 12;

  if (years <= 0) return `${remainMonths} tháng`;
  return `${years} năm ${remainMonths} tháng`;
}

function emptyEmployee(): EmployeeProfile {
  return {
    id: `emp-${Date.now()}`,
    name: '',
    email: '',
    employeeCode: '',
    group: 'UP',
    position: '',
    joinDate: '',
    workStatus: 'Đang làm việc',
    monthlyScore: '',
    badge: '',
    avatarUrl: '',
    note: '',
  };
}

export default function HrSystemPage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [search, setSearch] = useState('');
  const [filterGroup, setFilterGroup] = useState<string>('Tất cả');
  const [editing, setEditing] = useState<EmployeeProfile>(emptyEmployee());

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
    { label: 'Lịch Team Quản Lý', href: '/team-schedule' },
    { label: 'Hệ thống nhân sự', href: '/hr-system' },
    { label: 'Checklist theo Ca', href: '/shift-checklist' },
    { label: 'Cấu hình ca', href: '/shift-config' },
    { label: 'Cài đặt', href: '/settings' },
  ];

  const updateData = (nextData: PortalData) => {
    setData(nextData);
    savePortalData(nextData);
  };

  const filteredEmployees = useMemo(() => {
    if (!data) return [];

    const q = search.trim().toLowerCase();

    return data.employees.filter((item) => {
      const matchSearch =
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.employeeCode.toLowerCase().includes(q) ||
        item.position.toLowerCase().includes(q);

      const matchGroup = filterGroup === 'Tất cả' || item.group === filterGroup;

      return matchSearch && matchGroup;
    });
  }, [data, search, filterGroup]);

  const groupedEmployees = useMemo(() => {
    return GROUP_ORDER.map((group) => ({
      group,
      items: filteredEmployees.filter((item) => item.group === group),
    })).filter((group) => group.items.length > 0);
  }, [filteredEmployees]);

  const stats = useMemo(() => {
    if (!data) return { total: 0, active: 0, senior: 0 };

    return {
      total: data.employees.length,
      active: data.employees.filter(
        (item) => item.workStatus === 'Đang làm việc'
      ).length,
      senior: data.employees.filter((item) => item.group === 'SENIOR').length,
    };
  }, [data]);

  const saveEmployee = () => {
    if (!data) return;
    if (!editing.name.trim()) return;

    const exists = data.employees.some((item) => item.id === editing.id);

    const nextEmployees = exists
      ? data.employees.map((item) => (item.id === editing.id ? editing : item))
      : [...data.employees, editing];

    updateData({
      ...data,
      employees: nextEmployees,
    });
  };

  const deleteEmployee = () => {
    if (!data) return;
    if (!editing.id) return;

    const isCurrentProfile = editing.id === data.profile.employeeId;
    if (isCurrentProfile) {
      alert(
        'Nhân sự này đang gắn với tài khoản hiện tại nên không xóa ở đây được.'
      );
      return;
    }

    updateData({
      ...data,
      employees: data.employees.filter((item) => item.id !== editing.id),
    });

    setEditing(emptyEmployee());
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
            <SidebarMenu items={menu} activeHref="/hr-system" />
          </aside>

          <section className="min-w-0 flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Hệ thống nhân sự
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Quản lý và theo dõi toàn bộ nhân sự trong team
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
              <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Tổng nhân sự</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.total}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Đang làm việc</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.active}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Senior</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {stats.senior}
                  </h2>
                </div>
              </div>

              <div className="mt-6">
                <AdminCreateUserCard />
              </div>

              <div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Danh sách nhân sự
                    </h2>

                    <div className="flex flex-wrap gap-3">
                      <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Tìm tên, email, MSNV..."
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                      />

                      <select
                        value={filterGroup}
                        onChange={(e) => setFilterGroup(e.target.value)}
                        className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="Tất cả">Tất cả</option>
                        {GROUP_ORDER.map((group) => (
                          <option key={group} value={group}>
                            {group}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 space-y-8">
                    {groupedEmployees.map((group) => (
                      <div key={group.group}>
                        <h3 className="mb-4 text-sm font-bold uppercase tracking-[0.2em] text-sky-600">
                          {group.group}
                        </h3>

                        <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                          {group.items.map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setEditing(item)}
                              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-left transition hover:border-emerald-400 hover:bg-white"
                            >
                              <div className="flex items-start gap-3">
                                <UserAvatar
                                  name={item.name}
                                  avatarUrl={item.avatarUrl}
                                  size="lg"
                                />

                                <div className="min-w-0">
                                  <p className="truncate text-base font-bold text-sky-600">
                                    {item.name}
                                  </p>
                                  <p className="text-sm font-semibold text-slate-800">
                                    {item.position || item.group}
                                  </p>

                                  {item.badge && (
                                    <p className="mt-1 text-xs font-semibold text-amber-600">
                                      {item.badge}
                                    </p>
                                  )}

                                  <div className="mt-2 space-y-1 text-xs text-slate-500">
                                    <p>
                                      MSNV: {item.employeeCode || 'Chưa có'}
                                    </p>
                                    <p>
                                      Thâm niên: {calcTenure(item.joinDate)}
                                    </p>
                                    <p>Trạng thái: {item.workStatus}</p>
                                    <p>
                                      Điểm tháng:{' '}
                                      <span className="font-semibold text-emerald-600">
                                        {item.monthlyScore || 'Chưa có dữ liệu'}
                                      </span>
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Thông tin nhân sự
                    </h2>

                    <button
                      onClick={() => setEditing(emptyEmployee())}
                      className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                    >
                      Tạo mới
                    </button>
                  </div>

                  <div className="mt-5 flex items-center gap-4">
                    <UserAvatar
                      name={editing.name || 'Nhân sự'}
                      avatarUrl={editing.avatarUrl}
                      size="xl"
                    />
                    <p className="text-sm text-slate-500">
                      Muốn thay avatar nhanh thì dán thẳng link ảnh vào ô Avatar
                      URL.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4">
                    <input
                      value={editing.name}
                      onChange={(e) =>
                        setEditing({ ...editing, name: e.target.value })
                      }
                      placeholder="Tên nhân sự"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <input
                      value={editing.email}
                      onChange={(e) =>
                        setEditing({ ...editing, email: e.target.value })
                      }
                      placeholder="Email"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <input
                      value={editing.employeeCode}
                      onChange={(e) =>
                        setEditing({ ...editing, employeeCode: e.target.value })
                      }
                      placeholder="MSNV"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <select
                      value={editing.group}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          group: e.target.value as EmployeeGroup,
                        })
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      {GROUP_ORDER.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>

                    <input
                      value={editing.position}
                      onChange={(e) =>
                        setEditing({ ...editing, position: e.target.value })
                      }
                      placeholder="Chức vụ hiển thị"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <input
                      type="date"
                      value={editing.joinDate}
                      onChange={(e) =>
                        setEditing({ ...editing, joinDate: e.target.value })
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <select
                      value={editing.workStatus}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          workStatus: e.target.value as EmployeeWorkStatus,
                        })
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="Đang làm việc">Đang làm việc</option>
                      <option value="Thử việc">Thử việc</option>
                      <option value="Tạm nghỉ">Tạm nghỉ</option>
                    </select>

                    <input
                      value={editing.monthlyScore}
                      onChange={(e) =>
                        setEditing({ ...editing, monthlyScore: e.target.value })
                      }
                      placeholder="Điểm tháng"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <input
                      value={editing.badge}
                      onChange={(e) =>
                        setEditing({ ...editing, badge: e.target.value })
                      }
                      placeholder="Badge / top (ví dụ: SENIOR • #1)"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <input
                      value={editing.avatarUrl}
                      onChange={(e) =>
                        setEditing({ ...editing, avatarUrl: e.target.value })
                      }
                      placeholder="Avatar URL"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <textarea
                      value={editing.note}
                      onChange={(e) =>
                        setEditing({ ...editing, note: e.target.value })
                      }
                      placeholder="Ghi chú"
                      rows={3}
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="mt-5 flex flex-wrap gap-3">
                    <button
                      onClick={saveEmployee}
                      className="rounded-full bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                    >
                      Lưu nhân sự
                    </button>

                    <button
                      onClick={deleteEmployee}
                      className="rounded-full bg-rose-50 px-5 py-3 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                    >
                      Xóa nhân sự
                    </button>
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

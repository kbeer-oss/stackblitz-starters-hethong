'use client';

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
  type TeamScheduleMonth,
} from '@/lib/portal-storage';

const shiftCycle = ['', '1', '2', '3', '4', '5', '6', 'P', 'NDH'] as const;

function getDaysInMonth(monthValue: string) {
  const [yearStr, monthStr] = monthValue.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!year || !month) return 30;
  return new Date(year, month, 0).getDate();
}

function buildDateFromMonth(monthValue: string, dayNumber: number) {
  return `${monthValue}-${String(dayNumber).padStart(2, '0')}`;
}

function isSunday(date: string) {
  const raw = new Date(`${date}T00:00:00`);
  return raw.getDay() === 0;
}

function getWorkdayCount(dayCodes: string[]) {
  return dayCodes.filter((code) => code && code !== 'P' && code !== 'NDH')
    .length;
}

function shiftCodeClass(code: string) {
  switch (code) {
    case '1':
      return 'bg-white text-slate-800';
    case '2':
      return 'bg-lime-50 text-slate-800';
    case '3':
      return 'bg-lime-400 text-slate-900';
    case '4':
      return 'bg-sky-100 text-sky-800';
    case '5':
      return 'bg-yellow-100 text-yellow-800';
    case '6':
      return 'bg-amber-300 text-slate-900';
    case 'P':
      return 'bg-rose-200 text-rose-800';
    case 'NDH':
      return 'bg-slate-200 text-slate-700';
    default:
      return 'bg-slate-50 text-slate-400';
  }
}

function nextShiftCode(current: string) {
  const index = shiftCycle.findIndex((item) => item === current);
  if (index === -1) return shiftCycle[1];
  return shiftCycle[(index + 1) % shiftCycle.length];
}

function getTodayMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export default function TeamSchedulePage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getTodayMonth());

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

  const availableMonths = useMemo(() => {
    if (!data) return [];
    return [...data.teamScheduleMonths]
      .map((item) => item.month)
      .sort((a, b) => a.localeCompare(b));
  }, [data]);

  useEffect(() => {
    if (!data) return;
    if (availableMonths.length === 0) return;

    if (!availableMonths.includes(selectedMonth)) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [data, availableMonths, selectedMonth]);

  const currentMonthData = useMemo<TeamScheduleMonth | null>(() => {
    if (!data) return null;
    return (
      data.teamScheduleMonths.find((item) => item.month === selectedMonth) ??
      null
    );
  }, [data, selectedMonth]);

  const dayCount = useMemo(
    () => getDaysInMonth(selectedMonth),
    [selectedMonth]
  );

  const cycleCellShift = (memberId: string, dayIndex: number) => {
    if (!data || !currentMonthData) return;

    const nextMonths = data.teamScheduleMonths.map((month) =>
      month.month === currentMonthData.month
        ? {
            ...month,
            rows: month.rows.map((row) =>
              row.memberId === memberId
                ? {
                    ...row,
                    dayCodes: row.dayCodes.map((code, index) =>
                      index === dayIndex ? nextShiftCode(code) : code
                    ),
                  }
                : row
            ),
          }
        : month
    );

    updateData({
      ...data,
      teamScheduleMonths: nextMonths,
    });
  };

  if (!data || !currentMonthData) {
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
            <SidebarMenu items={menu} activeHref="/team-schedule" />
          </aside>

          <section className="min-w-0 flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Lịch Team Quản Lý
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Quản lý lịch làm việc theo tháng của team
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
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      Bảng phân ca theo tháng
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Bấm vào từng ô để đổi mã ca
                    </p>
                  </div>

                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                  >
                    {availableMonths.map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="bg-slate-900 text-white">
                        <th className="px-3 py-3 text-sm font-semibold">SL</th>
                        <th className="px-3 py-3 text-sm font-semibold">
                          Tên NV
                        </th>
                        <th className="px-3 py-3 text-sm font-semibold">
                          Chức vụ
                        </th>

                        {Array.from({ length: dayCount }, (_, i) => {
                          const date = buildDateFromMonth(selectedMonth, i + 1);
                          return (
                            <th
                              key={date}
                              className={`min-w-[48px] px-2 py-3 text-center text-sm font-semibold ${
                                isSunday(date) ? 'bg-sky-700' : 'bg-slate-800'
                              }`}
                            >
                              {i + 1}
                            </th>
                          );
                        })}

                        <th className="px-3 py-3 text-sm font-semibold">
                          Workday
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {data.teamScheduleMembers
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((member) => {
                          const row =
                            currentMonthData.rows.find(
                              (item) => item.memberId === member.id
                            ) ?? null;

                          return (
                            <tr
                              key={member.id}
                              className="border-b border-slate-100 bg-white"
                            >
                              <td className="px-3 py-3 text-center text-sm text-slate-700">
                                {member.order}
                              </td>

                              <td className="px-3 py-3 text-sm font-semibold text-slate-800">
                                {member.name}
                              </td>

                              <td className="px-3 py-3 text-sm text-slate-600">
                                {member.title}
                              </td>

                              {Array.from(
                                { length: dayCount },
                                (_, dayIndex) => {
                                  const date = buildDateFromMonth(
                                    selectedMonth,
                                    dayIndex + 1
                                  );
                                  const code = row?.dayCodes[dayIndex] ?? '';

                                  return (
                                    <td
                                      key={date}
                                      className="px-1 py-1 text-center"
                                    >
                                      <button
                                        onClick={() =>
                                          cycleCellShift(member.id, dayIndex)
                                        }
                                        className={`min-w-[42px] rounded-lg px-2 py-2 text-xs font-bold transition ring-1 ring-slate-200 ${shiftCodeClass(
                                          code
                                        )}`}
                                        title="Bấm để đổi ca"
                                      >
                                        {code || '-'}
                                      </button>
                                    </td>
                                  );
                                }
                              )}

                              <td className="px-3 py-3 text-center text-sm font-semibold text-slate-800">
                                {getWorkdayCount(row?.dayCodes ?? [])}
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PortalAuthGuard>
  );
}

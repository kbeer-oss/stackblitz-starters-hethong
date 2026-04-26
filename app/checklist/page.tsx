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
  type DailyShiftAssignment,
  type PortalData,
  type ShiftChecklistGroup,
  type ShiftChecklistItem,
  type ShiftChecklistPriority,
} from '@/lib/portal-storage';

function getTodayMonth() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;
}

function getMonthDates(monthValue: string) {
  const [yearStr, monthStr] = monthValue.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);

  if (!year || !month) return [];

  const daysInMonth = new Date(year, month, 0).getDate();

  return Array.from({ length: daysInMonth }, (_, index) => {
    const day = index + 1;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(
      2,
      '0'
    )}`;
  });
}

function randomShiftCode(shiftCodes: string[]) {
  if (shiftCodes.length === 0) return '1';
  return shiftCodes[Math.floor(Math.random() * shiftCodes.length)];
}

function priorityClass(priority: ShiftChecklistPriority) {
  switch (priority) {
    case 'Rất cao':
      return 'bg-rose-100 text-rose-700';
    case 'Cao':
      return 'bg-amber-100 text-amber-700';
    case 'Trung bình':
      return 'bg-emerald-100 text-emerald-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

function formatDateLabel(date: string) {
  const raw = new Date(`${date}T00:00:00`);
  if (Number.isNaN(raw.getTime())) return date;

  return raw.toLocaleDateString('vi-VN', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export default function ChecklistPage() {
  const router = useRouter();

  const [data, setData] = useState<PortalData | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(getTodayMonth());
  const [selectedDate, setSelectedDate] = useState(getTodayDate());

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

  useEffect(() => {
    if (!data) return;

    const monthDates = getMonthDates(selectedMonth);
    if (monthDates.length === 0) return;

    const existingSet = new Set(
      data.dailyShiftAssignments.map((item) => item.date)
    );
    const shiftCodes = data.shiftChecklists.map((item) => item.shiftCode);

    const missingAssignments: DailyShiftAssignment[] = monthDates
      .filter((date) => !existingSet.has(date))
      .map((date) => ({
        date,
        shiftCode: randomShiftCode(shiftCodes),
        completedTaskIds: [],
      }));

    if (missingAssignments.length > 0) {
      updateData({
        ...data,
        dailyShiftAssignments: [
          ...data.dailyShiftAssignments,
          ...missingAssignments,
        ].sort((a, b) => a.date.localeCompare(b.date)),
      });
      return;
    }

    if (!selectedDate.startsWith(selectedMonth)) {
      const today = getTodayDate();
      setSelectedDate(today.startsWith(selectedMonth) ? today : monthDates[0]);
    }
  }, [data, selectedMonth, selectedDate]);

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

  const monthDates = useMemo(
    () => getMonthDates(selectedMonth),
    [selectedMonth]
  );

  const monthAssignments = useMemo(() => {
    if (!data) return [];
    const monthSet = new Set(monthDates);
    return data.dailyShiftAssignments.filter((item) => monthSet.has(item.date));
  }, [data, monthDates]);

  const selectedAssignment = useMemo(() => {
    return monthAssignments.find((item) => item.date === selectedDate) ?? null;
  }, [monthAssignments, selectedDate]);

  const selectedShiftTemplate = useMemo(() => {
    if (!data || !selectedAssignment) return null;

    return (
      data.shiftChecklists.find(
        (item) => item.shiftCode === selectedAssignment.shiftCode
      ) ?? null
    );
  }, [data, selectedAssignment]);

  const selectedTasks = useMemo(() => {
    if (!selectedAssignment || !selectedShiftTemplate) return [];

    return selectedShiftTemplate.items.map((item) => ({
      ...item,
      completed: selectedAssignment.completedTaskIds.includes(item.id),
    }));
  }, [selectedAssignment, selectedShiftTemplate]);

  const monthSummary = useMemo(() => {
    const counts: Record<string, number> = {};
    monthAssignments.forEach((item) => {
      counts[item.shiftCode] = (counts[item.shiftCode] ?? 0) + 1;
    });
    return counts;
  }, [monthAssignments]);

  const rerandomMonth = () => {
    if (!data) return;

    const confirmed = window.confirm(
      `Random lại toàn bộ ca trong tháng ${selectedMonth}?`
    );
    if (!confirmed) return;

    const shiftCodes = data.shiftChecklists.map((item) => item.shiftCode);
    const targetDates = new Set(monthDates);

    const nextAssignments = data.dailyShiftAssignments.map((item) => {
      if (!targetDates.has(item.date)) return item;

      return {
        ...item,
        shiftCode: randomShiftCode(shiftCodes),
        completedTaskIds: [],
      };
    });

    updateData({
      ...data,
      dailyShiftAssignments: nextAssignments,
    });
  };

  const updateShiftForDate = (date: string, shiftCode: string) => {
    if (!data) return;

    updateData({
      ...data,
      dailyShiftAssignments: data.dailyShiftAssignments.map((item) =>
        item.date === date
          ? {
              ...item,
              shiftCode,
              completedTaskIds: [],
            }
          : item
      ),
    });
  };

  const toggleTaskForDate = (date: string, itemId: string) => {
    if (!data) return;

    updateData({
      ...data,
      dailyShiftAssignments: data.dailyShiftAssignments.map((item) => {
        if (item.date !== date) return item;

        const exists = item.completedTaskIds.includes(itemId);

        return {
          ...item,
          completedTaskIds: exists
            ? item.completedTaskIds.filter((id) => id !== itemId)
            : [...item.completedTaskIds, itemId],
        };
      }),
    });
  };

  const updateShiftTemplateItem = (
    shiftCode: string,
    itemId: string,
    patch: Partial<ShiftChecklistItem>
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
          <aside className="w-[250px] bg-slate-900 text-white">
            <SidebarBrand />
            <SidebarMenu items={menu} activeHref="/checklist" />
          </aside>

          <section className="flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Checklist theo Ca
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Chọn ngày để xem ca làm việc và tick checklist theo đúng ca
                  của ngày đó
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
                  <p className="text-sm text-slate-500">Tháng đang xem</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {selectedMonth}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Ca 1 trong tháng</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {monthSummary['1'] ?? 0}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Ca 4 trong tháng</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {monthSummary['4'] ?? 0}
                  </h2>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Ca 6 trong tháng</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {monthSummary['6'] ?? 0}
                  </h2>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      Lịch làm việc tháng
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Mỗi ngày sẽ được gán ngẫu nhiên một ca, anh có thể chọn
                      lại nếu muốn
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <input
                      type="month"
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                    />

                    <button
                      onClick={rerandomMonth}
                      className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      Random lại tháng
                    </button>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-7 gap-3">
                  {monthDates.map((date) => {
                    const assignment =
                      monthAssignments.find((item) => item.date === date) ??
                      null;
                    const isSelected = date === selectedDate;
                    const dayNumber = Number(date.slice(-2));

                    return (
                      <button
                        key={date}
                        onClick={() => setSelectedDate(date)}
                        className={`rounded-2xl border p-3 text-left transition ${
                          isSelected
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-slate-200 bg-white hover:border-emerald-300'
                        }`}
                      >
                        <p className="text-sm font-bold text-slate-800">
                          {dayNumber}
                        </p>
                        <p className="mt-2 text-xs text-slate-500">Ca</p>
                        <p className="text-lg font-bold text-emerald-600">
                          {assignment?.shiftCode ?? '-'}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-800">
                      Checklist theo ngày được chọn
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {formatDateLabel(selectedDate)}
                    </p>
                  </div>

                  {selectedAssignment && (
                    <div className="flex items-center gap-3">
                      <div>
                        <p className="text-sm text-slate-500">
                          Ca của ngày này
                        </p>
                        <select
                          value={selectedAssignment.shiftCode}
                          onChange={(e) =>
                            updateShiftForDate(
                              selectedAssignment.date,
                              e.target.value
                            )
                          }
                          className="mt-1 rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                        >
                          {data.shiftChecklists.map((group) => (
                            <option
                              key={group.shiftCode}
                              value={group.shiftCode}
                            >
                              Ca {group.shiftCode}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="rounded-2xl bg-slate-50 px-4 py-3">
                        <p className="text-xs text-slate-500">Hoàn thành</p>
                        <p className="text-lg font-bold text-slate-800">
                          {
                            selectedTasks.filter((item) => item.completed)
                              .length
                          }
                          /{selectedTasks.length}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-5 overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Check
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Check List
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Task/Công việc
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          File đính kèm
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Mức độ ưu tiên
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {selectedTasks.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-sm text-slate-500"
                          >
                            Chưa có dữ liệu checklist cho ngày này.
                          </td>
                        </tr>
                      ) : (
                        selectedTasks.map((item) => (
                          <tr
                            key={item.id}
                            className={`border-b border-slate-100 last:border-b-0 ${
                              item.completed ? 'bg-emerald-50/60' : ''
                            }`}
                          >
                            <td className="px-4 py-3">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() =>
                                  toggleTaskForDate(selectedDate, item.id)
                                }
                                className="h-4 w-4 accent-emerald-600"
                              />
                            </td>

                            <td className="px-4 py-3 text-sm font-semibold text-slate-700">
                              {item.taskLabel}
                            </td>

                            <td className="px-4 py-3 text-sm">
                              <p
                                className={`font-medium ${
                                  item.completed
                                    ? 'text-slate-400 line-through'
                                    : 'text-slate-800'
                                }`}
                              >
                                {item.title}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-sm text-slate-600">
                              {!item.attachmentName ? (
                                <span className="text-slate-400">-</span>
                              ) : item.attachmentUrl ? (
                                <a
                                  href={item.attachmentUrl}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                                >
                                  {item.attachmentName}
                                </a>
                              ) : (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700">
                                  {item.attachmentName}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm">
                              <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${priorityClass(
                                  item.priority
                                )}`}
                              >
                                {item.priority}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="mt-6 space-y-6">
                {data.shiftChecklists.map((group: ShiftChecklistGroup) => (
                  <div
                    key={group.shiftCode}
                    className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-2xl font-bold text-slate-800">
                          Cấu hình Ca {group.shiftCode}
                        </h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Sửa trực tiếp file đính kèm và mức độ ưu tiên cho từng
                          task
                        </p>
                      </div>
                    </div>

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
                                    updateShiftTemplateItem(
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
                                    updateShiftTemplateItem(
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
                                    updateShiftTemplateItem(
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
            </div>
          </section>
        </div>
      </main>
    </PortalAuthGuard>
  );
}

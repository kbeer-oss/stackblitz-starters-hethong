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
  type ShiftChecklistPriority,
} from '@/lib/portal-storage';

const checklistShiftCodes = new Set(['1', '4', '6']);

function getTodayDate() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
    2,
    '0'
  )}-${String(now.getDate()).padStart(2, '0')}`;
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

function getShiftCodeFromSchedule(
  data: PortalData,
  memberId: string,
  date: string
) {
  const month = date.slice(0, 7);
  const dayNumber = Number(date.slice(-2));

  const monthData = data.teamScheduleMonths.find(
    (item) => item.month === month
  );
  if (!monthData) return '';

  const row = monthData.rows.find((item) => item.memberId === memberId);
  if (!row) return '';

  return row.dayCodes[dayNumber - 1] ?? '';
}

function findAssignment(
  assignments: DailyShiftAssignment[],
  date: string,
  memberId: string
) {
  return (
    assignments.find(
      (item) => item.date === date && (item.memberId ?? '') === memberId
    ) ?? null
  );
}

export default function ShiftChecklistPage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);
  const [selectedDate, setSelectedDate] = useState(getTodayDate());
  const [selectedMemberId, setSelectedMemberId] = useState('');

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

  useEffect(() => {
    if (!data) return;
    if (!selectedMemberId && data.teamScheduleMembers.length > 0) {
      setSelectedMemberId(data.teamScheduleMembers[0].id);
    }
  }, [data, selectedMemberId]);

  const currentMember = useMemo(() => {
    if (!data) return null;
    return (
      data.teamScheduleMembers.find(
        (member) => member.id === selectedMemberId
      ) ?? null
    );
  }, [data, selectedMemberId]);

  const selectedShiftCode = useMemo(() => {
    if (!data || !selectedMemberId) return '';
    return getShiftCodeFromSchedule(data, selectedMemberId, selectedDate);
  }, [data, selectedMemberId, selectedDate]);

  useEffect(() => {
    if (!data || !selectedMemberId || !selectedShiftCode) return;
    if (!checklistShiftCodes.has(selectedShiftCode)) return;

    const existing = findAssignment(
      data.dailyShiftAssignments,
      selectedDate,
      selectedMemberId
    );

    if (!existing) {
      updateData({
        ...data,
        dailyShiftAssignments: [
          ...data.dailyShiftAssignments,
          {
            date: selectedDate,
            memberId: selectedMemberId,
            shiftCode: selectedShiftCode,
            completedTaskIds: [],
          },
        ],
      });
      return;
    }

    if (existing.shiftCode !== selectedShiftCode) {
      updateData({
        ...data,
        dailyShiftAssignments: data.dailyShiftAssignments.map((item) =>
          item.date === selectedDate &&
          (item.memberId ?? '') === selectedMemberId
            ? {
                ...item,
                shiftCode: selectedShiftCode,
                completedTaskIds: [],
              }
            : item
        ),
      });
    }
  }, [data, selectedDate, selectedMemberId, selectedShiftCode]);

  const selectedAssignment = useMemo(() => {
    if (!data || !selectedMemberId) return null;
    return findAssignment(
      data.dailyShiftAssignments,
      selectedDate,
      selectedMemberId
    );
  }, [data, selectedDate, selectedMemberId]);

  const selectedShiftTemplate = useMemo(() => {
    if (!data) return null;
    if (!checklistShiftCodes.has(selectedShiftCode)) return null;

    return (
      data.shiftChecklists.find(
        (item) => item.shiftCode === selectedShiftCode
      ) ?? null
    );
  }, [data, selectedShiftCode]);

  const selectedChecklistItems = useMemo(() => {
    if (!selectedShiftTemplate) return [];

    return selectedShiftTemplate.items.map((item) => ({
      ...item,
      completed:
        selectedAssignment?.completedTaskIds.includes(item.id) ?? false,
    }));
  }, [selectedShiftTemplate, selectedAssignment]);

  const toggleTask = (itemId: string) => {
    if (
      !data ||
      !selectedMemberId ||
      !checklistShiftCodes.has(selectedShiftCode)
    )
      return;

    const existing = findAssignment(
      data.dailyShiftAssignments,
      selectedDate,
      selectedMemberId
    );

    if (!existing) {
      updateData({
        ...data,
        dailyShiftAssignments: [
          ...data.dailyShiftAssignments,
          {
            date: selectedDate,
            memberId: selectedMemberId,
            shiftCode: selectedShiftCode,
            completedTaskIds: [itemId],
          },
        ],
      });
      return;
    }

    const hasItem = existing.completedTaskIds.includes(itemId);

    updateData({
      ...data,
      dailyShiftAssignments: data.dailyShiftAssignments.map((item) => {
        const isTarget =
          item.date === selectedDate &&
          (item.memberId ?? '') === selectedMemberId;

        if (!isTarget) return item;

        return {
          ...item,
          completedTaskIds: hasItem
            ? item.completedTaskIds.filter((id) => id !== itemId)
            : [...item.completedTaskIds, itemId],
        };
      }),
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
            <SidebarMenu items={menu} activeHref="/shift-checklist" />
          </aside>

          <section className="min-w-0 flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  Checklist theo Ca
                </h1>
                <p className="mt-1 text-sm text-slate-500">
                  Chọn nhân sự và ngày để hiện checklist theo đúng ca
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
                <div className="grid gap-4 md:grid-cols-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Nhân sự
                    </label>
                    <select
                      value={selectedMemberId}
                      onChange={(e) => setSelectedMemberId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                    >
                      {data.teamScheduleMembers
                        .slice()
                        .sort((a, b) => a.order - b.order)
                        .map((member) => (
                          <option key={member.id} value={member.id}>
                            {member.name} - {member.title}
                          </option>
                        ))}
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Ngày
                    </label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Ca</p>
                    <p className="mt-2 text-2xl font-bold text-emerald-600">
                      {selectedShiftCode || '-'}
                    </p>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-sm text-slate-500">Ngày đang chọn</p>
                    <p className="mt-2 text-sm font-semibold text-slate-800">
                      {formatDateLabel(selectedDate)}
                    </p>
                  </div>
                </div>

                {!selectedShiftCode ? (
                  <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                    Không tìm thấy ca làm việc của nhân sự này trong ngày đã
                    chọn.
                  </div>
                ) : !checklistShiftCodes.has(selectedShiftCode) ? (
                  <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-5 text-sm text-amber-700">
                    Ngày này là ca <strong>{selectedShiftCode}</strong>. Hiện
                    chỉ có checklist mẫu cho ca 1, 4 và 6.
                  </div>
                ) : (
                  <div className="mt-6 overflow-x-auto">
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
                        {selectedChecklistItems.map((item) => (
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
                                onChange={() => toggleTask(item.id)}
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
                              {!item.attachmentName && !item.attachmentUrl ? (
                                <span className="text-slate-400">-</span>
                              ) : (
                                <a
                                  href={item.attachmentUrl || '#'}
                                  target="_blank"
                                  rel="noreferrer"
                                  className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                                    item.attachmentUrl
                                      ? 'bg-sky-50 text-sky-700 hover:bg-sky-100 underline-offset-2 hover:underline'
                                      : 'bg-slate-100 text-slate-700'
                                  }`}
                                  onClick={(e) => {
                                    if (!item.attachmentUrl) e.preventDefault();
                                  }}
                                >
                                  {item.attachmentName || 'Mở file'}
                                </a>
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
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>
    </PortalAuthGuard>
  );
}

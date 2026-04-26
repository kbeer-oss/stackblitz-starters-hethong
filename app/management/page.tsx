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
  savePortalData,
  type PortalData,
  type TaskItem,
  type TaskPriority,
  type TaskStatus,
  type WorkLinkItem,
} from '@/lib/portal-storage';

function createId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function ManagementPage() {
  const router = useRouter();
  const [data, setData] = useState<PortalData | null>(null);

  const [taskSearch, setTaskSearch] = useState('');
  const [taskStatusFilter, setTaskStatusFilter] = useState<
    'Tất cả' | TaskStatus
  >('Tất cả');

  const [linkSearch, setLinkSearch] = useState('');

  const [taskForm, setTaskForm] = useState<{
    title: string;
    priority: TaskPriority;
    status: TaskStatus;
    dueDate: string;
    note: string;
  }>({
    title: '',
    priority: 'Trung bình',
    status: 'Chưa làm',
    dueDate: '',
    note: '',
  });

  const [linkForm, setLinkForm] = useState({
    title: '',
    url: '',
    note: '',
  });

  const [noteText, setNoteText] = useState('');

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editingTaskForm, setEditingTaskForm] = useState<TaskItem | null>(null);

  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);
  const [editingLinkForm, setEditingLinkForm] = useState<WorkLinkItem | null>(
    null
  );

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

  const updateData = (nextData: PortalData) => {
    setData(nextData);
    savePortalData(nextData);
  };

  const addTask = () => {
    if (!data) return;
    if (!taskForm.title.trim()) return;

    const nextData: PortalData = {
      ...data,
      tasks: [
        {
          id: createId('task'),
          title: taskForm.title.trim(),
          priority: taskForm.priority,
          status: taskForm.status,
          dueDate: taskForm.dueDate,
          note: taskForm.note.trim(),
          isPinned: false,
        },
        ...data.tasks,
      ],
    };

    updateData(nextData);
    setTaskForm({
      title: '',
      priority: 'Trung bình',
      status: 'Chưa làm',
      dueDate: '',
      note: '',
    });
  };

  const addWorkLink = () => {
    if (!data) return;
    if (!linkForm.title.trim() || !linkForm.url.trim()) return;

    const nextData: PortalData = {
      ...data,
      workLinks: [
        {
          id: createId('link'),
          title: linkForm.title.trim(),
          url: linkForm.url.trim(),
          note: linkForm.note.trim(),
          isPinned: false,
        },
        ...data.workLinks,
      ],
    };

    updateData(nextData);
    setLinkForm({
      title: '',
      url: '',
      note: '',
    });
  };

  const addNote = () => {
    if (!data) return;
    if (!noteText.trim()) return;

    updateData({
      ...data,
      notes: [{ id: createId('note'), text: noteText.trim() }, ...data.notes],
    });

    setNoteText('');
  };

  const deleteTask = (id: string) => {
    if (!data) return;
    updateData({
      ...data,
      tasks: data.tasks.filter((item) => item.id !== id),
    });
  };

  const deleteLink = (id: string) => {
    if (!data) return;
    updateData({
      ...data,
      workLinks: data.workLinks.filter((item) => item.id !== id),
    });
  };

  const deleteNote = (id: string) => {
    if (!data) return;
    updateData({
      ...data,
      notes: data.notes.filter((item) => item.id !== id),
    });
  };

  const toggleTaskPin = (id: string) => {
    if (!data) return;

    updateData({
      ...data,
      tasks: data.tasks.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      ),
    });
  };

  const toggleLinkPin = (id: string) => {
    if (!data) return;

    updateData({
      ...data,
      workLinks: data.workLinks.map((item) =>
        item.id === id ? { ...item, isPinned: !item.isPinned } : item
      ),
    });
  };

  const startEditTask = (task: TaskItem) => {
    setEditingTaskId(task.id);
    setEditingTaskForm({ ...task });
  };

  const saveEditTask = () => {
    if (!data || !editingTaskId || !editingTaskForm) return;

    updateData({
      ...data,
      tasks: data.tasks.map((item) =>
        item.id === editingTaskId ? editingTaskForm : item
      ),
    });

    setEditingTaskId(null);
    setEditingTaskForm(null);
  };

  const startEditLink = (item: WorkLinkItem) => {
    setEditingLinkId(item.id);
    setEditingLinkForm({ ...item });
  };

  const saveEditLink = () => {
    if (!data || !editingLinkId || !editingLinkForm) return;

    updateData({
      ...data,
      workLinks: data.workLinks.map((item) =>
        item.id === editingLinkId ? editingLinkForm : item
      ),
    });

    setEditingLinkId(null);
    setEditingLinkForm(null);
  };

  const filteredTasks = useMemo(() => {
    if (!data) return [];

    return data.tasks.filter((task) => {
      const search = taskSearch.trim().toLowerCase();
      const matchSearch =
        !search ||
        task.title.toLowerCase().includes(search) ||
        task.note.toLowerCase().includes(search);

      const matchStatus =
        taskStatusFilter === 'Tất cả' || task.status === taskStatusFilter;

      return matchSearch && matchStatus;
    });
  }, [data, taskSearch, taskStatusFilter]);

  const filteredLinks = useMemo(() => {
    if (!data) return [];

    return data.workLinks.filter((item) => {
      const search = linkSearch.trim().toLowerCase();
      if (!search) return true;

      return (
        item.title.toLowerCase().includes(search) ||
        item.url.toLowerCase().includes(search) ||
        item.note.toLowerCase().includes(search)
      );
    });
  }, [data, linkSearch]);

  const menu = [
    { label: 'Tổng quan', href: '/dashboard' },
    { label: 'Quản lý', href: '/management' },
    { label: 'Báo cáo', href: '/reports' },
    { label: 'Lịch công việc', href: '/schedule' },
    { label: 'Cài đặt', href: '/settings' },
  ];

  const badgeClass = (value: string) => {
    switch (value) {
      case 'Cao':
        return 'bg-rose-50 text-rose-700';
      case 'Trung bình':
        return 'bg-amber-50 text-amber-700';
      case 'Thấp':
        return 'bg-emerald-50 text-emerald-700';
      case 'Đang làm':
        return 'bg-sky-50 text-sky-700';
      case 'Chưa làm':
        return 'bg-slate-100 text-slate-700';
      case 'Hoàn thành':
        return 'bg-emerald-50 text-emerald-700';
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
            <SidebarMenu items={menu} activeHref="/management" />
          </aside>

          <section className="flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Quản lý</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Quản lý công việc, link công việc và ghi chú quan trọng
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
                  <p className="text-sm text-slate-500">Tổng công việc</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {data.tasks.length}
                  </h2>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Link công việc</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {data.workLinks.length}
                  </h2>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Ghi chú</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {data.notes.length}
                  </h2>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200">
                  <p className="text-sm text-slate-500">Link ghim</p>
                  <h2 className="mt-2 text-3xl font-bold text-slate-800">
                    {data.workLinks.filter((item) => item.isPinned).length}
                  </h2>
                </div>
              </div>

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Thêm công việc
                  </h2>

                  <div className="mt-4 grid gap-3 md:grid-cols-2">
                    <input
                      value={taskForm.title}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, title: e.target.value })
                      }
                      placeholder="Tên công việc"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500 md:col-span-2"
                    />

                    <select
                      value={taskForm.priority}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          priority: e.target.value as TaskPriority,
                        })
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="Cao">Cao</option>
                      <option value="Trung bình">Trung bình</option>
                      <option value="Thấp">Thấp</option>
                    </select>

                    <select
                      value={taskForm.status}
                      onChange={(e) =>
                        setTaskForm({
                          ...taskForm,
                          status: e.target.value as TaskStatus,
                        })
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="Chưa làm">Chưa làm</option>
                      <option value="Đang làm">Đang làm</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                    </select>

                    <input
                      type="date"
                      value={taskForm.dueDate}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, dueDate: e.target.value })
                      }
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />

                    <input
                      value={taskForm.note}
                      onChange={(e) =>
                        setTaskForm({ ...taskForm, note: e.target.value })
                      }
                      placeholder="Ghi chú"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={addTask}
                    className="mt-4 rounded-full bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                  >
                    + Lưu công việc
                  </button>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Thêm Link công việc
                  </h2>

                  <div className="mt-4 grid gap-3">
                    <input
                      value={linkForm.title}
                      onChange={(e) =>
                        setLinkForm({ ...linkForm, title: e.target.value })
                      }
                      placeholder="Tên link công việc"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                    <input
                      value={linkForm.url}
                      onChange={(e) =>
                        setLinkForm({ ...linkForm, url: e.target.value })
                      }
                      placeholder="https://..."
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                    <input
                      value={linkForm.note}
                      onChange={(e) =>
                        setLinkForm({ ...linkForm, note: e.target.value })
                      }
                      placeholder="Ghi chú"
                      className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={addWorkLink}
                    className="mt-4 rounded-full bg-emerald-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-emerald-600"
                  >
                    + Lưu Link công việc
                  </button>
                </div>
              </div>

              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Danh sách công việc
                  </h2>

                  <div className="flex flex-wrap gap-3">
                    <input
                      value={taskSearch}
                      onChange={(e) => setTaskSearch(e.target.value)}
                      placeholder="Tìm công việc..."
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                    />

                    <select
                      value={taskStatusFilter}
                      onChange={(e) =>
                        setTaskStatusFilter(
                          e.target.value as 'Tất cả' | TaskStatus
                        )
                      }
                      className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                    >
                      <option value="Tất cả">Tất cả trạng thái</option>
                      <option value="Chưa làm">Chưa làm</option>
                      <option value="Đang làm">Đang làm</option>
                      <option value="Hoàn thành">Hoàn thành</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-left">
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Công việc
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Ưu tiên
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Trạng thái
                        </th>
                        <th className="px-4 py-3 text-sm font-semibold text-slate-700">
                          Deadline
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
                      {filteredTasks.length === 0 ? (
                        <tr>
                          <td
                            colSpan={6}
                            className="px-4 py-6 text-center text-sm text-slate-500"
                          >
                            Không có công việc phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredTasks.map((task) => (
                          <tr
                            key={task.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-4 py-3 text-sm">
                              {editingTaskId === task.id && editingTaskForm ? (
                                <div className="grid gap-2">
                                  <input
                                    value={editingTaskForm.title}
                                    onChange={(e) =>
                                      setEditingTaskForm({
                                        ...editingTaskForm,
                                        title: e.target.value,
                                      })
                                    }
                                    className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                  />
                                  <input
                                    value={editingTaskForm.note}
                                    onChange={(e) =>
                                      setEditingTaskForm({
                                        ...editingTaskForm,
                                        note: e.target.value,
                                      })
                                    }
                                    placeholder="Ghi chú"
                                    className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                  />
                                </div>
                              ) : (
                                <div>
                                  <p className="font-medium text-slate-800">
                                    {task.title}
                                  </p>
                                  {task.note && (
                                    <p className="mt-1 text-xs text-slate-500">
                                      {task.note}
                                    </p>
                                  )}
                                </div>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm">
                              {editingTaskId === task.id && editingTaskForm ? (
                                <select
                                  value={editingTaskForm.priority}
                                  onChange={(e) =>
                                    setEditingTaskForm({
                                      ...editingTaskForm,
                                      priority: e.target.value as TaskPriority,
                                    })
                                  }
                                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                >
                                  <option value="Cao">Cao</option>
                                  <option value="Trung bình">Trung bình</option>
                                  <option value="Thấp">Thấp</option>
                                </select>
                              ) : (
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(
                                    task.priority
                                  )}`}
                                >
                                  {task.priority}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm">
                              {editingTaskId === task.id && editingTaskForm ? (
                                <select
                                  value={editingTaskForm.status}
                                  onChange={(e) =>
                                    setEditingTaskForm({
                                      ...editingTaskForm,
                                      status: e.target.value as TaskStatus,
                                    })
                                  }
                                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                >
                                  <option value="Chưa làm">Chưa làm</option>
                                  <option value="Đang làm">Đang làm</option>
                                  <option value="Hoàn thành">Hoàn thành</option>
                                </select>
                              ) : (
                                <span
                                  className={`rounded-full px-3 py-1 text-xs font-medium ${badgeClass(
                                    task.status
                                  )}`}
                                >
                                  {task.status}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm text-slate-600">
                              {editingTaskId === task.id && editingTaskForm ? (
                                <input
                                  type="date"
                                  value={editingTaskForm.dueDate}
                                  onChange={(e) =>
                                    setEditingTaskForm({
                                      ...editingTaskForm,
                                      dueDate: e.target.value,
                                    })
                                  }
                                  className="rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                />
                              ) : (
                                task.dueDate || '-'
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleTaskPin(task.id)}
                                className={`rounded-full px-3 py-1 text-xs font-medium ${
                                  task.isPinned
                                    ? 'bg-amber-50 text-amber-700'
                                    : 'bg-slate-100 text-slate-700'
                                }`}
                              >
                                {task.isPinned ? 'Đã ghim' : 'Ghim'}
                              </button>
                            </td>

                            <td className="px-4 py-3">
                              <div className="flex flex-wrap gap-2">
                                {editingTaskId === task.id ? (
                                  <>
                                    <button
                                      onClick={saveEditTask}
                                      className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingTaskId(null);
                                        setEditingTaskForm(null);
                                      }}
                                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                                    >
                                      Hủy
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditTask(task)}
                                      className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => deleteTask(task.id)}
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

              <div className="mt-6 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Danh mục Link công việc
                  </h2>

                  <input
                    value={linkSearch}
                    onChange={(e) => setLinkSearch(e.target.value)}
                    placeholder="Tìm link công việc..."
                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm outline-none focus:border-emerald-500"
                  />
                </div>

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
                          Hành động
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredLinks.length === 0 ? (
                        <tr>
                          <td
                            colSpan={5}
                            className="px-4 py-6 text-center text-sm text-slate-500"
                          >
                            Không có link công việc phù hợp.
                          </td>
                        </tr>
                      ) : (
                        filteredLinks.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-slate-100 last:border-b-0"
                          >
                            <td className="px-4 py-3 text-sm">
                              {editingLinkId === item.id && editingLinkForm ? (
                                <input
                                  value={editingLinkForm.title}
                                  onChange={(e) =>
                                    setEditingLinkForm({
                                      ...editingLinkForm,
                                      title: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                />
                              ) : (
                                <p className="font-medium text-slate-800">
                                  {item.title}
                                </p>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm text-slate-600">
                              {editingLinkId === item.id && editingLinkForm ? (
                                <input
                                  value={editingLinkForm.url}
                                  onChange={(e) =>
                                    setEditingLinkForm({
                                      ...editingLinkForm,
                                      url: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                />
                              ) : (
                                <span className="inline-block max-w-[320px] truncate align-middle">
                                  {item.url}
                                </span>
                              )}
                            </td>

                            <td className="px-4 py-3 text-sm text-slate-500">
                              {editingLinkId === item.id && editingLinkForm ? (
                                <input
                                  value={editingLinkForm.note}
                                  onChange={(e) =>
                                    setEditingLinkForm({
                                      ...editingLinkForm,
                                      note: e.target.value,
                                    })
                                  }
                                  className="w-full rounded-lg border border-slate-200 px-3 py-2 outline-none focus:border-emerald-500"
                                />
                              ) : (
                                item.note || '-'
                              )}
                            </td>

                            <td className="px-4 py-3">
                              <button
                                onClick={() => toggleLinkPin(item.id)}
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
                                <a
                                  href={item.url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700"
                                >
                                  Mở
                                </a>

                                {editingLinkId === item.id ? (
                                  <>
                                    <button
                                      onClick={saveEditLink}
                                      className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                                    >
                                      Lưu
                                    </button>
                                    <button
                                      onClick={() => {
                                        setEditingLinkId(null);
                                        setEditingLinkForm(null);
                                      }}
                                      className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700"
                                    >
                                      Hủy
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={() => startEditLink(item)}
                                      className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                                    >
                                      Sửa
                                    </button>
                                    <button
                                      onClick={() => deleteLink(item.id)}
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

              <div className="mt-6 grid gap-6 xl:grid-cols-2">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Ghi chú quan trọng
                  </h2>

                  <div className="mt-4 flex gap-3">
                    <input
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder="Nhập ghi chú..."
                      className="flex-1 rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={addNote}
                      className="rounded-full bg-slate-900 px-4 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                    >
                      + Lưu
                    </button>
                  </div>

                  <div className="mt-4 space-y-3">
                    {data.notes.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        Chưa có ghi chú nào.
                      </p>
                    ) : (
                      data.notes.map((note) => (
                        <div
                          key={note.id}
                          className="rounded-xl border border-slate-200 bg-slate-50 p-4"
                        >
                          <p className="text-sm text-slate-700">{note.text}</p>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="mt-3 rounded-full bg-rose-50 px-3 py-1 text-xs font-medium text-rose-700"
                          >
                            Xóa ghi chú
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Mẹo sử dụng nhanh
                  </h2>

                  <div className="mt-4 space-y-3 text-sm text-slate-600">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      Dùng <strong>Ghim</strong> cho công việc và link quan
                      trọng để hiện nổi bật ở Dashboard.
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      Dùng ô <strong>Tìm kiếm</strong> để lọc nhanh công việc
                      hoặc link công việc.
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      Mục <strong>Lịch công việc</strong> sẽ tự chia việc theo
                      Hôm nay / Sắp tới / Quá hạn.
                    </div>
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

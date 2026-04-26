'use client';

import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import PortalAuthGuard from '@/components/portal-auth-guard';
import SidebarBrand from '@/components/sidebar-brand';
import SidebarMenu from '@/components/sidebar-menu';
import UserAvatar from '@/components/user-avatar';
import { logout, extractYubiKeyPublicId } from '@/lib/auth-storage';
import {
  getPortalData,
  savePortalData,
  resetPortalData,
  type PortalData,
  type UserProfile,
} from '@/lib/portal-storage';

export default function SettingsPage() {
  const router = useRouter();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const [data, setData] = useState<PortalData | null>(null);
  const [form, setForm] = useState<UserProfile | null>(null);
  const [saved, setSaved] = useState(false);
  const [yubiOtpInput, setYubiOtpInput] = useState('');
  const [yubiMessage, setYubiMessage] = useState('');
  const [avatarMessage, setAvatarMessage] = useState('');

  useEffect(() => {
    const load = () => {
      const current = getPortalData();
      setData(current);
      setForm(current.profile);
    };

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

  const previewPublicId = useMemo(() => {
    return extractYubiKeyPublicId(yubiOtpInput);
  }, [yubiOtpInput]);

  const saveProfile = () => {
    if (!data || !form) return;

    const nextData: PortalData = {
      ...data,
      profile: {
        ...form,
        yubikeyPublicId: form.yubikeyPublicId.trim().toLowerCase(),
      },
      reports: data.reports.map((item) => ({
        ...item,
        owner:
          item.owner === data.profile.displayName
            ? form.displayName
            : item.owner,
      })),
    };

    setData(nextData);
    setForm(nextData.profile);
    savePortalData(nextData);

    setSaved(true);
    setTimeout(() => {
      setSaved(false);
    }, 1500);
  };

  const useYubiOtp = () => {
    if (!form) return;

    if (previewPublicId.length < 12) {
      setYubiMessage('OTP YubiKey chưa đủ để lấy 12 ký tự đầu.');
      return;
    }

    setForm({
      ...form,
      yubikeyPublicId: previewPublicId,
    });
    setYubiMessage('Đã lấy 12 ký tự đầu của YubiKey.');
  };

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !form) return;

    if (!file.type.startsWith('image/')) {
      setAvatarMessage('File avatar phải là ảnh.');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setAvatarMessage('Ảnh avatar nên nhỏ hơn 2MB.');
      return;
    }

    const reader = new FileReader();

    reader.onload = () => {
      setForm({
        ...form,
        avatarUrl: String(reader.result || ''),
      });
      setAvatarMessage('Đã cập nhật avatar, nhớ bấm Lưu thay đổi.');
    };

    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleRemoveAvatar = () => {
    if (!form) return;
    setForm({
      ...form,
      avatarUrl: '',
    });
    setAvatarMessage('Đã xóa avatar, nhớ bấm Lưu thay đổi.');
  };

  const handleResetAll = () => {
    const confirmed = window.confirm(
      'Anh có chắc muốn reset toàn bộ dữ liệu về mặc định không?'
    );

    if (!confirmed) return;

    resetPortalData();
    logout();
    router.replace('/login');
  };

  if (!data || !form) {
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
            <SidebarMenu items={menu} activeHref="/settings" />
          </aside>

          <section className="flex-1">
            <header className="flex items-center justify-between border-b border-slate-200 bg-white px-8 py-5">
              <div>
                <h1 className="text-3xl font-bold text-slate-800">Cài đặt</h1>
                <p className="mt-1 text-sm text-slate-500">
                  Đổi mật khẩu demo, avatar, bật tắt YubiKey và quản lý dữ liệu
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
                    {form.displayName}
                  </p>
                  <p className="text-xs text-slate-500">{form.role}</p>
                </div>

                <UserAvatar
                  name={form.displayName}
                  avatarUrl={form.avatarUrl}
                  size="md"
                />
              </div>
            </header>

            <div className="p-8">
              <div className="grid gap-6 xl:grid-cols-3">
                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
                  <h2 className="text-xl font-semibold text-slate-800">
                    Xem trước hồ sơ
                  </h2>

                  <div className="mt-5 flex items-center gap-4">
                    <UserAvatar
                      name={form.displayName}
                      avatarUrl={form.avatarUrl}
                      size="xl"
                    />

                    <div>
                      <p className="text-lg font-semibold text-slate-800">
                        {form.displayName}
                      </p>
                      <p className="text-sm text-slate-500">{form.email}</p>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Vai trò
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-800">
                        {form.role}
                      </p>
                    </div>

                    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        YubiKey hiện tại
                      </p>
                      <p className="mt-1 break-all font-mono text-sm font-medium text-slate-800">
                        {form.yubikeyPublicId || 'Chưa cài'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200 xl:col-span-2">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-slate-800">
                      Tùy chọn hệ thống
                    </h2>

                    <button
                      onClick={saveProfile}
                      className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                    >
                      Lưu thay đổi
                    </button>
                  </div>

                  {saved && (
                    <div className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                      Đã lưu thành công 🎉
                    </div>
                  )}

                  {avatarMessage && (
                    <div className="mt-4 rounded-xl border border-violet-200 bg-violet-50 px-4 py-3 text-sm text-violet-700">
                      {avatarMessage}
                    </div>
                  )}

                  <div className="mt-5 grid gap-4 md:grid-cols-2">
                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Tên hiển thị</p>
                      <input
                        value={form.displayName}
                        onChange={(e) =>
                          setForm({ ...form, displayName: e.target.value })
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Email</p>
                      <input
                        value={form.email}
                        onChange={(e) =>
                          setForm({ ...form, email: e.target.value })
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Vai trò</p>
                      <input
                        value={form.role}
                        onChange={(e) =>
                          setForm({ ...form, role: e.target.value })
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Múi giờ</p>
                      <input
                        value={form.timezone}
                        onChange={(e) =>
                          setForm({ ...form, timezone: e.target.value })
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Ngôn ngữ</p>
                      <select
                        value={form.language}
                        onChange={(e) =>
                          setForm({ ...form, language: e.target.value })
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="Tiếng Việt">Tiếng Việt</option>
                        <option value="English">English</option>
                      </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Giao diện</p>
                      <select
                        value={form.theme}
                        onChange={(e) =>
                          setForm({ ...form, theme: e.target.value })
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="Sáng">Sáng</option>
                        <option value="Tối">Tối</option>
                      </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Nhận thông báo</p>
                      <select
                        value={form.notifications ? 'Bật' : 'Tắt'}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            notifications: e.target.value === 'Bật',
                          })
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="Bật">Bật</option>
                        <option value="Tắt">Tắt</option>
                      </select>
                    </div>

                    <div className="rounded-2xl border border-slate-200 p-5">
                      <p className="text-sm text-slate-500">Nhắc deadline</p>
                      <select
                        value={form.deadlineReminders ? 'Bật' : 'Tắt'}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            deadlineReminders: e.target.value === 'Bật',
                          })
                        }
                        className="mt-3 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      >
                        <option value="Bật">Bật</option>
                        <option value="Tắt">Tắt</option>
                      </select>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Avatar cá nhân
                    </h3>

                    <div className="mt-4 flex flex-wrap items-center gap-4">
                      <UserAvatar
                        name={form.displayName}
                        avatarUrl={form.avatarUrl}
                        size="xl"
                      />

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={() => avatarInputRef.current?.click()}
                          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                        >
                          Chọn avatar
                        </button>

                        <button
                          type="button"
                          onClick={handleRemoveAvatar}
                          className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                        >
                          Xóa avatar
                        </button>

                        <input
                          ref={avatarInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handleAvatarFile}
                          className="hidden"
                        />
                      </div>
                    </div>

                    <p className="mt-4 text-sm text-slate-500">
                      Avatar nhỏ hơn 2MB. Sau khi chọn ảnh, nhớ bấm{' '}
                      <strong>Lưu thay đổi</strong>.
                    </p>
                  </div>
                  <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Thông tin nhân sự
                    </h3>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">MSNV</p>
                        <input
                          value={form.employeeCode}
                          onChange={(e) =>
                            setForm({ ...form, employeeCode: e.target.value })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Nhóm nhân sự</p>
                        <select
                          value={form.hrGroup}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              hrGroup: e.target.value as typeof form.hrGroup,
                            })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        >
                          <option value="CAP">CAP</option>
                          <option value="UP CAP">UP CAP</option>
                          <option value="UP CAP TRAINING">
                            UP CAP TRAINING
                          </option>
                          <option value="UP TRAINING">UP TRAINING</option>
                          <option value="UP">UP</option>
                          <option value="TRAINING">TRAINING</option>
                          <option value="SENIOR">SENIOR</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Chức vụ hiển thị
                        </p>
                        <input
                          value={form.hrPosition}
                          onChange={(e) =>
                            setForm({ ...form, hrPosition: e.target.value })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Ngày vào làm</p>
                        <input
                          type="date"
                          value={form.joinDate}
                          onChange={(e) =>
                            setForm({ ...form, joinDate: e.target.value })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Trạng thái làm việc
                        </p>
                        <select
                          value={form.workStatus}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              workStatus: e.target
                                .value as typeof form.workStatus,
                            })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        >
                          <option value="Đang làm việc">Đang làm việc</option>
                          <option value="Thử việc">Thử việc</option>
                          <option value="Tạm nghỉ">Tạm nghỉ</option>
                        </select>
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">Điểm tháng</p>
                        <input
                          value={form.monthlyScore}
                          onChange={(e) =>
                            setForm({ ...form, monthlyScore: e.target.value })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <p className="text-sm text-slate-500">
                          Badge / xếp hạng
                        </p>
                        <input
                          value={form.employeeBadge}
                          onChange={(e) =>
                            setForm({ ...form, employeeBadge: e.target.value })
                          }
                          placeholder="Ví dụ: SENIOR • #1"
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Bảo mật đăng nhập
                    </h3>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="text-sm text-slate-500">Mật khẩu demo</p>
                        <input
                          type="password"
                          value={form.demoPassword}
                          onChange={(e) =>
                            setForm({ ...form, demoPassword: e.target.value })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <p className="text-sm text-slate-500">
                          Yêu cầu YubiKey
                        </p>
                        <select
                          value={form.requireYubiKey ? 'Bật' : 'Tắt'}
                          onChange={(e) =>
                            setForm({
                              ...form,
                              requireYubiKey: e.target.value === 'Bật',
                            })
                          }
                          className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                        >
                          <option value="Bật">Bật</option>
                          <option value="Tắt">Tắt</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Cài đặt YubiKey
                    </h3>

                    <div className="mt-4 grid gap-4">
                      <input
                        value={yubiOtpInput}
                        onChange={(e) => {
                          setYubiOtpInput(e.target.value);
                          setYubiMessage('');
                        }}
                        placeholder="Chạm hoặc dán OTP YubiKey vào đây"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />

                      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          12 ký tự đầu nhận được
                        </p>
                        <p className="mt-2 break-all font-mono text-sm font-semibold text-slate-800">
                          {previewPublicId || 'Chưa có dữ liệu'}
                        </p>
                      </div>

                      <input
                        value={form.yubikeyPublicId}
                        onChange={(e) =>
                          setForm({
                            ...form,
                            yubikeyPublicId: e.target.value
                              .toLowerCase()
                              .replace(/\s+/g, ''),
                          })
                        }
                        placeholder="12 ký tự đầu của YubiKey"
                        className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
                      />

                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          onClick={useYubiOtp}
                          className="rounded-full bg-emerald-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-emerald-600"
                        >
                          Lấy 12 ký tự đầu
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setYubiOtpInput('');
                            setYubiMessage('');
                          }}
                          className="rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                        >
                          Xóa OTP
                        </button>
                      </div>

                      {yubiMessage && (
                        <div className="rounded-xl border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-700">
                          {yubiMessage}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 rounded-2xl border border-slate-200 p-5">
                    <h3 className="text-lg font-semibold text-slate-800">
                      Dữ liệu
                    </h3>

                    <div className="mt-4 flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={handleResetAll}
                        className="rounded-full bg-rose-50 px-4 py-2 text-sm font-medium text-rose-700 transition hover:bg-rose-100"
                      >
                        Reset toàn bộ dữ liệu
                      </button>
                    </div>

                    <p className="mt-4 text-sm text-slate-500"></p>
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-full bg-slate-900 px-5 py-3 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  ← Trang Chủ
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>
    </PortalAuthGuard>
  );
}

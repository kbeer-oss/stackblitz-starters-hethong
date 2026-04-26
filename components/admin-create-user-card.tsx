'use client';

import { useState } from 'react';

export default function AdminCreateUserCard() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState<'member' | 'admin'>('member');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [errorText, setErrorText] = useState('');

  const handleCreateUser = async () => {
    setLoading(true);
    setMessage('');
    setErrorText('');

    try {
      const response = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          fullName,
          role,
        }),
      });

      const rawText = await response.text();

      let result: any = {};
      try {
        result = rawText ? JSON.parse(rawText) : {};
      } catch {
        result = { error: rawText || 'API không trả về JSON hợp lệ' };
      }

      if (!response.ok) {
        throw new Error(result.error || 'Tạo user thất bại');
      }

      setMessage(`Đã tạo user: ${result.createdEmail}`);
      setEmail('');
      setPassword('');
      setFullName('');
      setRole('member');
    } catch (error) {
      setErrorText(error instanceof Error ? error.message : 'Có lỗi xảy ra');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-200">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-800">Tạo user mới</h2>
          <p className="mt-1 text-sm text-slate-500">
            Admin nhập email, mật khẩu tạm và quyền để tạo tài khoản trực tiếp
          </p>
        </div>

        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
          Admin only
        </span>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-2">
        <input
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          placeholder="Họ tên"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />

        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />

        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Mật khẩu tạm"
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        />

        <select
          value={role}
          onChange={(e) => setRole(e.target.value as 'member' | 'admin')}
          className="rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-emerald-500"
        >
          <option value="member">member</option>
          <option value="admin">admin</option>
        </select>
      </div>

      {errorText && (
        <div className="mt-4 rounded-2xl bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {errorText}
        </div>
      )}

      {message && (
        <div className="mt-4 rounded-2xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {message}
        </div>
      )}

      <button
        type="button"
        onClick={handleCreateUser}
        disabled={loading}
        className="mt-5 rounded-full bg-emerald-500 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-600 disabled:opacity-60"
      >
        {loading ? 'Đang tạo...' : 'Tạo user'}
      </button>
    </div>
  );
}

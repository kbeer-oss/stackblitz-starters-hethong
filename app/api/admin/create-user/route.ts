import { NextResponse } from 'next/server';

type CreateUserBody = {
  email?: string;
  password?: string;
  fullName?: string;
  role?: 'admin' | 'member';
};

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function getRequiredEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secret = process.env.SUPABASE_SECRET_KEY;

  if (!url) {
    throw new Error('Thiếu NEXT_PUBLIC_SUPABASE_URL');
  }

  if (!secret) {
    throw new Error('Thiếu SUPABASE_SECRET_KEY');
  }

  return { url, secret };
}

async function supabaseFetch(path: string, init: RequestInit = {}) {
  const { url, secret } = getRequiredEnv();

  return fetch(`${url}${path}`, {
    ...init,
    cache: 'no-store',
    headers: {
      apikey: secret,
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as CreateUserBody;

    const email = String(body.email || '')
      .trim()
      .toLowerCase();
    const password = String(body.password || '').trim();
    const fullName = String(body.fullName || '').trim();
    const role = body.role === 'admin' ? 'admin' : 'member';

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Thiếu email hoặc mật khẩu' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Mật khẩu cần ít nhất 8 ký tự' },
        { status: 400 }
      );
    }

    const fullNameSafe = fullName || email.split('@')[0];

    // 1) Tạo auth user
    const createResp = await supabaseFetch('/auth/v1/admin/users', {
      method: 'POST',
      body: JSON.stringify({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: fullNameSafe,
        },
      }),
    });

    const createJson = await createResp.json().catch(() => ({} as any));

    if (!createResp.ok) {
      return NextResponse.json(
        {
          error:
            createJson?.msg ||
            createJson?.message ||
            createJson?.error_description ||
            createJson?.error ||
            'Tạo user thất bại',
        },
        { status: createResp.status }
      );
    }

    const newUserId = createJson?.user?.id;

    if (!newUserId) {
      return NextResponse.json(
        { error: 'Tạo user xong nhưng không lấy được user id' },
        { status: 500 }
      );
    }

    // 2) Upsert profiles
    const profileResp = await supabaseFetch(
      '/rest/v1/profiles?on_conflict=id',
      {
        method: 'POST',
        headers: {
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify([
          {
            id: newUserId,
            email,
            full_name: fullNameSafe,
            role,
          },
        ]),
      }
    );

    if (!profileResp.ok) {
      const profileJson = await profileResp.json().catch(() => ({} as any));
      return NextResponse.json(
        {
          error:
            profileJson?.message || profileJson?.error || 'Lỗi ghi profiles',
        },
        { status: 500 }
      );
    }

    // 3) Upsert employees
    const employeeResp = await supabaseFetch(
      '/rest/v1/employees?on_conflict=email',
      {
        method: 'POST',
        headers: {
          Prefer: 'resolution=merge-duplicates,return=representation',
        },
        body: JSON.stringify([
          {
            user_id: newUserId,
            email,
          },
        ]),
      }
    );

    if (!employeeResp.ok) {
      const employeeJson = await employeeResp.json().catch(() => ({} as any));
      return NextResponse.json(
        {
          error:
            employeeJson?.message || employeeJson?.error || 'Lỗi ghi employees',
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      createdEmail: email,
      createdUserId: newUserId,
      role,
    });
  } catch (error) {
    console.error('create-user route error:', error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : 'Lỗi server không xác định',
      },
      { status: 500 }
    );
  }
}

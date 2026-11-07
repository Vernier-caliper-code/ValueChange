'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { logoutAction } from '@/lib/actions/auth';

import { useCurrentUser } from './use-current-user';

export function HeaderAuth() {
  const router = useRouter();
  const { user, setUser } = useCurrentUser();
  const [pending, setPending] = useState(false);

  async function handleLogout() {
    setPending(true);
    await logoutAction();
    setUser(null);
    setPending(false);
    router.refresh();
  }

  return (
    <div className="flex min-w-[120px] items-center justify-end gap-3 text-[14px]">
      {user ? (
        <>
          <span className="text-ink">{user.username}</span>
          <button
            type="button"
            onClick={handleLogout}
            disabled={pending}
            className="text-muted hover:text-ink disabled:opacity-60"
          >
            退出
          </button>
        </>
      ) : (
        <>
          <Link href="/login" className="text-muted hover:text-ink">
            登录
          </Link>
          <span className="text-line">/</span>
          <Link href="/register" className="text-muted hover:text-ink">
            注册
          </Link>
        </>
      )}
    </div>
  );
}
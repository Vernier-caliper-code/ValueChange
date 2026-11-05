'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { logoutAction } from '@/lib/actions/auth';

type Me = { id: string; username: string } | null;

export function HeaderAuth() {
  const router = useRouter();
  const [user, setUser] = useState<Me>(null);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { user: Me }) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

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

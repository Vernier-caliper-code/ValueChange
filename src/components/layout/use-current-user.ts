'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

export type CurrentUser = { id: string; username: string } | null;

/** 拉取当前登录用户；路由变化（含登录/注册后的跳转）时重新拉取，避免展示过期状态。 */
export function useCurrentUser() {
  const pathname = usePathname();
  const [user, setUser] = useState<CurrentUser>(null);

  useEffect(() => {
    let cancelled = false;
    fetch('/api/auth/me', { cache: 'no-store' })
      .then((res) => res.json())
      .then((data: { user: CurrentUser }) => {
        if (!cancelled) setUser(data.user);
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, [pathname]);

  return { user, setUser };
}
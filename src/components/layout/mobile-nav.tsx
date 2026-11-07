'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { logoutAction } from '@/lib/actions/auth';

import { NAV_LINKS, isActivePath } from './nav-links';
import { useCurrentUser } from './use-current-user';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, setUser } = useCurrentUser();
  const [logoutPending, setLogoutPending] = useState(false);

  async function handleLogout() {
    setLogoutPending(true);
    await logoutAction();
    setUser(null);
    setLogoutPending(false);
    setOpen(false);
    router.refresh();
  }

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handleKeydown(event: KeyboardEvent) {
      if (event.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', handleKeydown);
    return () => document.removeEventListener('keydown', handleKeydown);
  }, []);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-label={open ? '关闭导航菜单' : '打开导航菜单'}
        aria-expanded={open}
        aria-controls="mobile-nav"
        onClick={() => setOpen((v) => !v)}
        className="relative z-50 flex h-[42px] w-[42px] flex-col items-center justify-center gap-[6px]"
      >
        <span className={`h-px w-5 bg-ink transition-transform ${open ? 'translate-y-[3.5px] rotate-45' : ''}`} />
        <span className={`h-px w-5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`h-px w-5 bg-ink transition-transform ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
      </button>
      <button
        type="button"
        aria-label="关闭导航菜单"
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`fixed inset-0 z-30 bg-ink/30 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />
      <nav
        id="mobile-nav"
        aria-label="手机导航"
        aria-hidden={!open}
        className={`fixed inset-y-0 left-0 z-40 w-[260px] border-r border-line bg-white transition-all duration-300 ease-out ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="flex flex-col gap-1 p-4 pt-6">
          {NAV_LINKS.map((link) => {
            const active = isActivePath(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={`rounded-md px-4 py-3 text-[15px] transition-colors ${
                  active ? 'bg-paper font-medium text-brand' : 'text-ink hover:bg-paper'
                }`}
              >
                {link.label}
              </Link>
            );
          })}
          <div className="my-2 border-t border-line" />
          {user ? (
            <div className="flex items-center justify-between rounded-md px-4 py-3">
              <span className="min-w-0 truncate text-[15px] text-ink">{user.username}</span>
              <button
                type="button"
                onClick={handleLogout}
                disabled={logoutPending}
                className="shrink-0 text-[14px] text-muted hover:text-ink disabled:opacity-60"
              >
                退出登录
              </button>
            </div>
          ) : (
            <Link href="/login" className="rounded-md px-4 py-3 text-[15px] text-brand">
              登录 / 注册 ↗
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
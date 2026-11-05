'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { NAV_LINKS, isActivePath } from './nav-links';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

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
        className="flex h-[42px] w-[42px] flex-col items-center justify-center gap-[6px]"
      >
        <span className={`h-px w-5 bg-ink transition-transform ${open ? 'translate-y-[3.5px] rotate-45' : ''}`} />
        <span className={`h-px w-5 bg-ink transition-opacity ${open ? 'opacity-0' : ''}`} />
        <span className={`h-px w-5 bg-ink transition-transform ${open ? '-translate-y-[3.5px] -rotate-45' : ''}`} />
      </button>
      {open ? (
        <nav id="mobile-nav" aria-label="手机导航" className="absolute inset-x-0 top-full border-b border-line bg-paper px-6 py-4">
          <div className="flex flex-col">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                aria-current={isActivePath(pathname, link.href) ? 'page' : undefined}
                className="border-b border-line/60 py-3.5 text-[15px] last:border-0"
              >
                {link.label}
              </Link>
            ))}
            <Link href="/login" className="py-3.5 text-[15px] text-brand">
              登录 / 注册 ↗
            </Link>
          </div>
        </nav>
      ) : null}
    </div>
  );
}

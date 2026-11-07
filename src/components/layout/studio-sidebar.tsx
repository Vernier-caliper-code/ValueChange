'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Brand } from './brand';

const NAV_ITEMS = [
  { label: '文章管理', href: '/studio/articles', icon: '≡' },
  { label: '工具管理', href: '/studio/tools', icon: '⌘' },
  { label: '商品管理', href: '/studio/products', icon: '◇' },
  { label: '精选管理', href: '/studio/featured', icon: '☆' },
  { label: '用户管理', href: '/studio/users', icon: '○' },
] as const;

export function StudioSidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {mobileOpen ? (
        <button
          type="button"
          aria-label="关闭后台导航"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-30 bg-ink/30 lg:hidden"
        />
      ) : (
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="fixed left-4 top-4 z-50 rounded-md border border-line bg-white p-2 lg:hidden"
          aria-label="打开后台导航"
        >
          ☰
        </button>
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-[240px] border-r border-line bg-white transition-transform lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-[76px] items-center justify-between border-b border-line px-6 lg:h-[92px]">
          <Brand size="sm" />
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-md border border-line p-2 text-muted hover:text-ink lg:hidden"
            aria-label="关闭后台导航"
          >
            ✕
          </button>
        </div>
        <nav aria-label="后台导航" className="flex flex-col gap-1 p-4">
          {NAV_ITEMS.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 rounded-md px-4 py-3 text-[14px] transition-colors ${
                  active ? 'bg-brand text-white' : 'text-muted hover:bg-paper hover:text-ink'
                }`}
              >
                <span className="text-[16px]">{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 border-t border-line p-4">
          <Link href="/" className="block text-[13px] text-muted hover:text-ink">
            ↗ 查看网站前台
          </Link>
          <Link href="/studio" className="mt-2 block text-[13px] text-muted hover:text-ink">
            ← 退出后台
          </Link>
        </div>
      </aside>
    </>
  );
}
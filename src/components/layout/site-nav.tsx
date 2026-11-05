'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { NAV_LINKS, isActivePath } from './nav-links';

export function SiteNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="主导航" className="ml-auto hidden items-center gap-8 lg:flex">
      {NAV_LINKS.map((link) => {
        const active = isActivePath(pathname, link.href);
        return (
          <Link
            key={link.href}
            href={link.href}
            aria-current={active ? 'page' : undefined}
            className={`relative py-8 text-[13px] whitespace-nowrap transition-colors ${
              active ? 'text-brand' : 'text-[#596477] hover:text-brand'
            }`}
          >
            {link.label}
            {active ? (
              <span className="absolute bottom-[21px] left-1/2 h-1 w-1 -translate-x-1/2 rounded-full bg-brand" />
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}

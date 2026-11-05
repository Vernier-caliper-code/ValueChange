import Link from 'next/link';

import { Container } from '@/components/ui/container';
import { buttonStyles } from '@/components/ui/button';
import { HeaderAuth } from './header-auth';
import { Brand } from './brand';
import { MobileNav } from './mobile-nav';
import { SiteNav } from './site-nav';

export function SiteHeader() {
  return (
    <>
      <a
        href="#main"
        className="absolute left-5 -top-20 z-[100] bg-ink px-5 py-2.5 text-white transition-[top] focus:top-3"
      >
        跳到主要内容
      </a>
      <header className="relative border-b border-line bg-paper/95">
        <Container className="flex h-[76px] items-center justify-between gap-6 lg:h-[92px]">
          <Brand />
          <SiteNav />
          <div className="hidden items-center gap-5 lg:flex">
            <HeaderAuth />
            <Link href="/products" className={buttonStyles({ size: 'sm' })}>
              看看我的作品 <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <MobileNav />
        </Container>
      </header>
    </>
  );
}

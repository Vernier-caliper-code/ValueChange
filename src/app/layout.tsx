import type { Metadata } from 'next';
import Link from 'next/link';

import { Container } from '@/components/ui/container';
import { HeaderAuth } from '@/components/layout/header-auth';

import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'ValuePass｜让想法，长成有价值的产品',
    template: '%s｜ValuePass',
  },
  description: 'AI 全栈实战、AI 工具评测、真实项目经验分享与作品展示。',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-CN">
      <body>
        <header className="border-b border-line">
          <Container className="flex h-[76px] items-center justify-between lg:h-[92px]">
            <Link href="/" className="flex items-center gap-2 font-semibold">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brand/icon.png" alt="ValuePass 标志" className="h-[34px] w-[34px] lg:h-[37px] lg:w-[37px]" />
              <span>ValuePass</span>
            </Link>
            <HeaderAuth />
          </Container>
        </header>
        {children}
      </body>
    </html>
  );
}

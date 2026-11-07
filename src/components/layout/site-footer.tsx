import Link from 'next/link';

import { Container } from '@/components/ui/container';
import { Brand } from './brand';

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-white">
      <Container className="py-9">
        <div className="flex flex-col gap-6 pb-7 md:flex-row md:items-center md:justify-between">
          <div>
            <Brand size="sm" />
            <p className="mt-2 text-[11px] text-muted">记录构建的过程，分享真正有用的经验。</p>
          </div>
          <div className="flex gap-6 text-[12px] text-[#6d788b]">
            <Link href="/articles" className="hover:text-brand">读一篇文章</Link>
            <Link href="/tools" className="hover:text-brand">发现好工具</Link>
            <Link href="/about#contact" className="hover:text-brand">联系我</Link>
          </div>
        </div>
        <div className="flex flex-col gap-3 border-t border-[#edf0f4] pt-5 text-[10px] text-[#929ba9] md:flex-row md:items-center md:justify-between">
          <span>© 2026 ValuePass · 分享 AI 全栈开发与真实经验</span>
        </div>
      </Container>
    </footer>
  );
}

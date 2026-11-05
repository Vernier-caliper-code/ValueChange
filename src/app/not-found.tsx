import Link from 'next/link';

import { Container } from '@/components/ui/container';
import { buttonStyles } from '@/components/ui/button';

export default function NotFound() {
  return (
    <main id="main">
      <Container className="flex flex-col items-center py-24 text-center lg:py-32">
        <div className="font-mono text-[72px] font-bold leading-none text-brand lg:text-[110px]">404</div>
        <h1 className="mt-6 text-[22px] font-bold lg:text-[28px]">这一页，还在路上。</h1>
        <p className="mt-4 text-[14px] leading-[2] text-muted">
          你访问的页面不存在，或者已经被移动。
          <br />
          不如回到首页，看看其他有趣的内容。
        </p>
        <Link href="/" className={`${buttonStyles()} mt-8`}>
          回到首页 <span aria-hidden="true">↗</span>
        </Link>
      </Container>
    </main>
  );
}

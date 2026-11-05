import Link from 'next/link';

import { Container } from '@/components/ui/container';
import { buttonStyles } from '@/components/ui/button';

export default function StudioNotFound() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <Container className="flex flex-col items-center py-24 text-center lg:py-32">
        <div className="font-mono text-[72px] font-bold leading-none text-brand lg:text-[110px]">404</div>
        <h1 className="mt-6 text-[22px] font-bold lg:text-[28px]">后台页面不存在</h1>
        <p className="mt-4 text-[14px] leading-[2] text-muted">
          你访问的后台页面不存在，或者已经被移动。
        </p>
        <Link href="/studio" className={`${buttonStyles()} mt-8`}>
          返回后台首页 <span aria-hidden="true">↗</span>
        </Link>
      </Container>
    </main>
  );
}

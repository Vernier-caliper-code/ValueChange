import Link from 'next/link';

import { Container } from '@/components/ui/container';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Container className="flex flex-col items-center py-16 lg:py-24">
        <section className="flex w-full max-w-[420px] flex-col items-center gap-8">
          {children}
          <p className="text-center text-[12px] leading-[1.8] text-muted">
            第一版登录不附带额外权益，全站内容无需登录即可浏览。
          </p>
          <Link href="/" className="text-[13px] text-muted hover:text-ink">
            ← 返回首页继续浏览
          </Link>
        </section>
      </Container>
    </main>
  );
}

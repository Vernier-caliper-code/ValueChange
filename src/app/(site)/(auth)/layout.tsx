import Link from 'next/link';

import { Container } from '@/components/ui/container';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <Container className="flex flex-col items-center py-16 lg:py-24">
        <section className="w-full max-w-[420px] rounded-xl border border-line bg-white p-8 shadow-[0_15px_50px_rgba(35,69,135,0.06)]">
          <div className="flex flex-col items-center gap-8">{children}</div>
        </section>
        <Link href="/" className="mt-8 text-[13px] text-muted hover:text-ink">
          ← 返回首页继续浏览
        </Link>
      </Container>
    </main>
  );
}
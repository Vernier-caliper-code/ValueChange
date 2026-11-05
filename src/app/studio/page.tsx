import { redirect } from 'next/navigation';
import Link from 'next/link';

import { requireStudioAdmin } from '@/lib/auth/studio';
import { StudioLoginForm } from '@/components/forms/studio-login-form';
import { Brand } from '@/components/layout/brand';

export default async function StudioLoginPage() {
  const user = await requireStudioAdmin();
  if (user) redirect('/studio/dashboard');

  return (
    <main className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-[400px] rounded-xl border border-line bg-white p-8 shadow-sm">
        <div className="mb-8 flex justify-center">
          <Brand size="sm" />
        </div>
        <h1 className="text-center text-[24px] font-bold">欢迎回来，创作者</h1>
        <p className="mt-2 text-center text-[14px] text-muted">登录后台，继续记录与分享。</p>
        <StudioLoginForm />
        <p className="mt-6 text-center text-[12px] leading-[1.8] text-muted">
          仅允许站长账号登录，入口不对外展示。
        </p>
        <Link href="/" className="mt-4 block text-center text-[13px] text-muted hover:text-ink">
          ← 返回网站首页
        </Link>
      </div>
    </main>
  );
}

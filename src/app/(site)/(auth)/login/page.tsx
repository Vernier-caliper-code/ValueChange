import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthForm } from '@/components/forms/auth-form';
import { getCurrentUser } from '@/lib/auth/current-user';

export const metadata: Metadata = { title: '登录' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirectTo?: string }>;
}) {
  if (await getCurrentUser()) redirect('/');
  const { redirectTo } = await searchParams;

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-[25px] font-bold lg:text-[30px]">欢迎回来</h1>
        <p className="text-[14px] text-muted">登录 ValuePass，继续你的探索。</p>
      </div>
      <AuthForm mode="login" redirectTo={redirectTo} />
    </>
  );
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { AuthForm } from '@/components/forms/auth-form';
import { getCurrentUser } from '@/lib/auth/current-user';

export const metadata: Metadata = { title: '注册' };

export default async function RegisterPage() {
  if (await getCurrentUser()) redirect('/');

  return (
    <>
      <div className="flex flex-col items-center gap-3 text-center">
        <h1 className="text-[25px] font-bold lg:text-[30px]">创建账号</h1>
        <p className="text-[14px] text-muted">注册 ValuePass，为后续权益铺路。</p>
      </div>
      <AuthForm mode="register" />
    </>
  );
}

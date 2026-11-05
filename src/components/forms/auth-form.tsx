'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

import { loginAction, registerAction } from '@/lib/actions/auth';

const inputClass =
  'h-12 w-full rounded-md border border-line bg-white px-4 text-[15px] outline-none transition-colors focus:border-brand focus:ring-2 focus:ring-brand/20';
const inputErrorClass = 'border-danger focus:border-danger focus:ring-danger/20';

export function AuthForm({
  mode,
  redirectTo,
}: {
  mode: 'login' | 'register';
  redirectTo?: string;
}) {
  const router = useRouter();
  const isLogin = mode === 'login';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setFieldErrors({});
    setPending(true);
    try {
      const result = isLogin
        ? await loginAction({ username, password, redirectTo })
        : await registerAction({ username, password, confirmPassword });
      if (result.ok) {
        router.push(result.data?.redirectTo ?? '/');
        router.refresh();
      } else {
        setError(result.message);
        setFieldErrors(result.fieldErrors ?? {});
      }
    } catch {
      setError('服务暂时不可用，请稍后重试');
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex w-full flex-col gap-5">
      <div>
        <label htmlFor="username" className="mb-2 block text-[14px] font-medium">
          账号
        </label>
        <input
          id="username"
          name="username"
          autoComplete="username"
          placeholder="请输入你的账号"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className={`${inputClass} ${fieldErrors.username ? inputErrorClass : ''}`}
        />
        {fieldErrors.username ? (
          <p role="alert" className="mt-1 text-[12px] text-danger">
            {fieldErrors.username}
          </p>
        ) : null}
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-[14px] font-medium">
          密码
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete={isLogin ? 'current-password' : 'new-password'}
          placeholder="至少 8 位字符"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className={`${inputClass} ${fieldErrors.password ? inputErrorClass : ''}`}
        />
        {fieldErrors.password ? (
          <p role="alert" className="mt-1 text-[12px] text-danger">
            {fieldErrors.password}
          </p>
        ) : null}
      </div>

      {!isLogin ? (
        <div>
          <label htmlFor="confirmPassword" className="mb-2 block text-[14px] font-medium">
            确认密码
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            placeholder="请再次输入密码"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className={`${inputClass} ${fieldErrors.confirmPassword ? inputErrorClass : ''}`}
          />
          {fieldErrors.confirmPassword ? (
            <p role="alert" className="mt-1 text-[12px] text-danger">
              {fieldErrors.confirmPassword}
            </p>
          ) : null}
        </div>
      ) : null}

      {error ? (
        <p role="alert" className="text-[13px] text-danger">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="h-12 w-full rounded-md bg-brand text-[15px] font-medium text-white transition-colors hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? '提交中…' : isLogin ? '登录' : '注册'}
      </button>

      <p className="text-center text-[13px] text-muted">
        {isLogin ? (
          <>
            还没有账号？{' '}
            <Link href="/register" className="text-brand hover:text-brand-dark">
              立即注册
            </Link>
            <span className="mt-2 block text-[12px]">忘记密码请联系站长重置</span>
          </>
        ) : (
          <>
            已有账号？{' '}
            <Link href="/login" className="text-brand hover:text-brand-dark">
              直接登录
            </Link>
          </>
        )}
      </p>
    </form>
  );
}

'use server';

import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  cleanupLoginAttempts,
  clearLoginAttempts,
  getLoginAttempt,
  recordLoginFailure,
} from '@/lib/auth/login-attempts';
import { buildAttemptKey, getClientIp, isLoginLocked } from '@/lib/auth/login-policy';
import { verifyPassword } from '@/lib/auth/password';
import { SESSION_COOKIE_NAME, createSession, getSessionCookieOptions } from '@/lib/auth/session';
import { findUserByUsername } from '@/lib/auth/users';
import { fail, ok, type ActionResult } from '@/lib/utils/result';
import { firstFieldErrors } from '@/lib/validation/field-errors';
import { loginSchema } from '@/lib/validation/auth';

export async function studioLoginAction(input: unknown): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', { fieldErrors: firstFieldErrors(parsed.error) });
  }
  const { username, password } = parsed.data;

  const ip = getClientIp(await headers());
  const key = buildAttemptKey(username, ip);

  const attempt = await getLoginAttempt(key);
  if (isLoginLocked(attempt?.lockedUntil)) return fail('AUTH_LOCKED');

  const user = await findUserByUsername(username);
  if (!user || user.role !== 'ADMIN' || !(await verifyPassword(password, user.passwordHash))) {
    const { locked } = await recordLoginFailure(key);
    return fail(locked ? 'AUTH_LOCKED' : 'AUTH_INVALID_CREDENTIALS');
  }
  if (user.status !== 'ACTIVE') return fail('AUTH_DISABLED');

  await clearLoginAttempts(key);
  await cleanupLoginAttempts();
  const { token, expiresAt } = await createSession(user.id);
  (await cookies()).set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(expiresAt));
  return ok();
}

export async function studioLogoutAction() {
  const store = await cookies();
  store.delete(SESSION_COOKIE_NAME);
  redirect('/studio');
}

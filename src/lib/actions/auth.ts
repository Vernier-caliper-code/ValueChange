'use server';

import { cookies, headers } from 'next/headers';

import {
  cleanupLoginAttempts,
  clearLoginAttempts,
  getLoginAttempt,
  recordLoginFailure,
} from '@/lib/auth/login-attempts';
import {
  buildAttemptKey,
  getClientIp,
  isLoginLocked,
} from '@/lib/auth/login-policy';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  SESSION_COOKIE_NAME,
  createSession,
  deleteSessionByToken,
  getSessionCookieOptions,
} from '@/lib/auth/session';
import { createUser, findUserByUsername } from '@/lib/auth/users';
import { fail, ok, type ActionResult } from '@/lib/utils/result';
import { firstFieldErrors } from '@/lib/validation/field-errors';
import { loginSchema, registerSchema } from '@/lib/validation/auth';

/** redirectTo 仅允许站内路径，防止开放重定向。 */
function sanitizeRedirectTo(value: string | undefined): string {
  if (value && value.startsWith('/') && !value.startsWith('//')) return value;
  return '/';
}

export async function registerAction(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return fail('VALIDATION_ERROR', { fieldErrors: firstFieldErrors(parsed.error) });
  }
  const { username, password } = parsed.data;

  const existing = await findUserByUsername(username);
  if (existing) return fail('AUTH_USERNAME_TAKEN');

  const user = await createUser({ username, passwordHash: await hashPassword(password) });
  const { token, expiresAt } = await createSession(user.id);
  (await cookies()).set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(expiresAt));
  return ok({ redirectTo: '/' });
}

export async function loginAction(input: unknown): Promise<ActionResult<{ redirectTo: string }>> {
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
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    const { locked } = await recordLoginFailure(key);
    return fail(locked ? 'AUTH_LOCKED' : 'AUTH_INVALID_CREDENTIALS');
  }
  if (user.status !== 'ACTIVE') return fail('AUTH_DISABLED');

  await clearLoginAttempts(key);
  await cleanupLoginAttempts();
  const { token, expiresAt } = await createSession(user.id);
  (await cookies()).set(SESSION_COOKIE_NAME, token, getSessionCookieOptions(expiresAt));
  return ok({ redirectTo: sanitizeRedirectTo(parsed.data.redirectTo) });
}

export async function logoutAction(): Promise<ActionResult> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (token) await deleteSessionByToken(token);
  store.delete(SESSION_COOKIE_NAME);
  return ok();
}

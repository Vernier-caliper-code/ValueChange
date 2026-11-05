export const LOGIN_MAX_FAILURES = 5;
export const LOGIN_LOCK_DURATION_MS = 15 * 60 * 1000;

export function buildAttemptKey(username: string, ip: string): string {
  return `login:${username.toLowerCase()}:${ip}`;
}

export function getClientIp(headerList: { get(name: string): string | null }): string {
  const xff = headerList.get('x-forwarded-for');
  const first = xff?.split(',')[0]?.trim();
  return first || 'unknown';
}

export function isLoginLocked(
  lockedUntil: Date | null | undefined,
  now: Date = new Date(),
): boolean {
  return !!lockedUntil && lockedUntil.getTime() > now.getTime();
}

/** 记录一次失败后的下一状态：失败计数 +1，达到上限则锁定 15 分钟。 */
export function nextFailureState(
  failedCount: number,
  now: Date = new Date(),
): { failedCount: number; lockedUntil: Date | null } {
  const next = failedCount + 1;
  if (next >= LOGIN_MAX_FAILURES) {
    return { failedCount: next, lockedUntil: new Date(now.getTime() + LOGIN_LOCK_DURATION_MS) };
  }
  return { failedCount: next, lockedUntil: null };
}

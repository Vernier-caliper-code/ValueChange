import { describe, expect, it } from 'vitest';

import {
  LOGIN_MAX_FAILURES,
  LOGIN_LOCK_DURATION_MS,
  buildAttemptKey,
  getClientIp,
  isLoginLocked,
  nextFailureState,
} from '@/lib/auth/login-policy';

describe('buildAttemptKey', () => {
  it('用户名转小写后拼接 IP', () => {
    expect(buildAttemptKey('Alice', '1.2.3.4')).toBe('login:alice:1.2.3.4');
  });
});

describe('getClientIp', () => {
  const headers = (v: string | null) => ({ get: () => v });
  it('取 x-forwarded-for 首段', () => {
    expect(getClientIp(headers('1.1.1.1, 2.2.2.2'))).toBe('1.1.1.1');
  });
  it('缺失时为 unknown', () => {
    expect(getClientIp(headers(null))).toBe('unknown');
  });
});

describe('nextFailureState', () => {
  const now = new Date('2026-11-05T00:00:00Z');
  it(`第 ${LOGIN_MAX_FAILURES} 次失败前不锁定`, () => {
    const state = nextFailureState(LOGIN_MAX_FAILURES - 2, now);
    expect(state.failedCount).toBe(LOGIN_MAX_FAILURES - 1);
    expect(state.lockedUntil).toBeNull();
  });
  it(`第 ${LOGIN_MAX_FAILURES} 次失败锁定 15 分钟`, () => {
    const state = nextFailureState(LOGIN_MAX_FAILURES - 1, now);
    expect(state.failedCount).toBe(LOGIN_MAX_FAILURES);
    expect(state.lockedUntil?.getTime()).toBe(now.getTime() + LOGIN_LOCK_DURATION_MS);
  });
});

describe('isLoginLocked', () => {
  const now = new Date('2026-11-05T00:00:00Z');
  it('未设置锁定时间不算锁定', () => {
    expect(isLoginLocked(null, now)).toBe(false);
    expect(isLoginLocked(undefined, now)).toBe(false);
  });
  it('锁定时间在未来为锁定', () => {
    expect(isLoginLocked(new Date(now.getTime() + 1000), now)).toBe(true);
  });
  it('锁定时间已过自动解除', () => {
    expect(isLoginLocked(new Date(now.getTime() - 1000), now)).toBe(false);
  });
});

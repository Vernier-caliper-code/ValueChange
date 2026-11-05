import { describe, expect, it } from 'vitest';

import { generateSessionToken, hashSessionToken } from '@/lib/auth/token';

describe('会话 Token', () => {
  it('生成 base64url 随机串且每次不同', () => {
    const a = generateSessionToken();
    const b = generateSessionToken();
    expect(a).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(a).not.toBe(b);
  });
  it('SHA-256 哈希为 64 位十六进制且可复现', () => {
    const token = 'sample-token';
    expect(hashSessionToken(token)).toMatch(/^[0-9a-f]{64}$/);
    expect(hashSessionToken(token)).toBe(hashSessionToken(token));
  });
  it('数据库哈希不等于原始 Token', () => {
    const token = generateSessionToken();
    expect(hashSessionToken(token)).not.toBe(token);
  });
});

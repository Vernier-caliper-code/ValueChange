import { describe, expect, it } from 'vitest';

import { hashPassword, verifyPassword } from '@/lib/auth/password';

describe('密码哈希', () => {
  it('哈希不可逆且可校验', async () => {
    const hash = await hashPassword('my-secret-9');
    expect(hash).not.toContain('my-secret-9');
    await expect(verifyPassword('my-secret-9', hash)).resolves.toBe(true);
    await expect(verifyPassword('wrong-pass', hash)).resolves.toBe(false);
  });
  it('同一密码两次哈希结果不同（随机盐）', async () => {
    const [a, b] = await Promise.all([hashPassword('same-pass-8'), hashPassword('same-pass-8')]);
    expect(a).not.toBe(b);
  });
});

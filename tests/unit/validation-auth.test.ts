import { describe, expect, it } from 'vitest';

import { loginSchema, passwordSchema, registerSchema, usernameSchema } from '@/lib/validation/auth';

describe('usernameSchema', () => {
  it('接受合法账号并统一转小写', () => {
    expect(usernameSchema.parse('Alice_01')).toBe('alice_01');
  });
  it('拒绝过短账号', () => {
    expect(usernameSchema.safeParse('ab').success).toBe(false);
  });
  it('拒绝超过 32 位的账号', () => {
    expect(usernameSchema.safeParse('a'.repeat(33)).success).toBe(false);
  });
  it('拒绝非法字符', () => {
    for (const bad of ['有中文', 'a-b', 'a b', 'a.b', 'a@b']) {
      expect(usernameSchema.safeParse(bad).success).toBe(false);
    }
  });
  it('去掉首尾空白', () => {
    expect(usernameSchema.parse('  bob_2  ')).toBe('bob_2');
  });
});

describe('passwordSchema', () => {
  it('要求 8~72 位', () => {
    expect(passwordSchema.safeParse('1234567').success).toBe(false);
    expect(passwordSchema.safeParse('12345678').success).toBe(true);
    expect(passwordSchema.safeParse('x'.repeat(73)).success).toBe(false);
  });
});

describe('registerSchema', () => {
  it('两次密码不一致时报 confirmPassword 字段错误', () => {
    const result = registerSchema.safeParse({
      username: 'new_user',
      password: 'password8',
      confirmPassword: 'password9',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toEqual(['confirmPassword']);
    }
  });
  it('合法输入通过', () => {
    expect(
      registerSchema.safeParse({
        username: 'new_user',
        password: 'password8',
        confirmPassword: 'password8',
      }).success,
    ).toBe(true);
  });
});

describe('loginSchema', () => {
  it('空密码不通过', () => {
    expect(loginSchema.safeParse({ username: 'alice', password: '' }).success).toBe(false);
  });
  it('redirectTo 可选', () => {
    expect(loginSchema.safeParse({ username: 'alice', password: 'x' }).success).toBe(true);
  });
});

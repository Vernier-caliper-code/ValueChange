import { describe, expect, it } from 'vitest';

import { ERROR_CODES, ERROR_MESSAGES, fail, ok } from '@/lib/utils/result';

describe('ActionResult', () => {
  it('ok 携带数据', () => {
    expect(ok({ a: 1 })).toEqual({ ok: true, data: { a: 1 } });
  });
  it('fail 使用错误码默认文案', () => {
    expect(fail('AUTH_LOCKED')).toEqual({
      ok: false,
      code: 'AUTH_LOCKED',
      message: '尝试次数过多，请 15 分钟后再试',
      fieldErrors: undefined,
    });
  });
  it('fail 支持字段级错误', () => {
    const result = fail('VALIDATION_ERROR', { fieldErrors: { username: '账号至少 3 位' } });
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.fieldErrors?.username).toBe('账号至少 3 位');
  });
  it('每个错误码都有默认文案且非空', () => {
    for (const code of ERROR_CODES) {
      expect(ERROR_MESSAGES[code].length).toBeGreaterThan(0);
    }
  });
});

/** 接口安全 E2E（UP-003、SEC-004）。 */
import { expect, test } from '@playwright/test';

test.describe('接口安全', () => {
  test('UP-003：未登录调用上传令牌接口返回 401', async ({ request }) => {
    const res = await request.post('/api/blob-upload', {
      data: { type: 'blob.generate-client-token', payload: {} },
    });
    expect(res.status()).toBe(401);
    const body = (await res.json()) as { error: { code: string } };
    expect(body.error.code).toBe('UNAUTHORIZED');
  });

  test('SEC-004：/api/auth/me 未登录返回空用户且禁止缓存', async ({ request }) => {
    const res = await request.get('/api/auth/me');
    expect(res.status()).toBe(200);
    expect(res.headers()['cache-control']).toContain('no-store');
    const body = (await res.json()) as { user: unknown };
    expect(body.user).toBeNull();
  });
});

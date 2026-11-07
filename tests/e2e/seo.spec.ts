/** SEO 检查 E2E（SEO-001 ~ SEO-003）。 */
import { expect, test } from '@playwright/test';

test.describe('SEO', () => {
  test('SEO-001：页面 title 模板、description 与 canonical 正确', async ({ page }) => {
    await page.goto('/articles/e2e-fixture-article');
    await expect(page).toHaveTitle(/E2E 夹具文章｜ValuePass/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/, { timeout: 5_000 });
    const canonical = page.locator('link[rel="canonical"]');
    await expect(canonical).toHaveAttribute('href', /\/articles\/e2e-fixture-article$/);
  });

  test('SEO-002：sitemap 含已发布内容与静态页，不含草稿和下架商品', async ({ request }) => {
    const res = await request.get('/sitemap.xml');
    expect(res.status()).toBe(200);
    const body = await res.text();

    expect(body).toContain('/articles/e2e-fixture-article');
    expect(body).toContain('/tools/e2e-fixture-tool');
    expect(body).toContain('/products/e2e-fixture-product');
    for (const path of ['/', '/articles', '/tools', '/insights', '/products', '/about']) {
      expect(body).toMatch(new RegExp(`<loc>[^<]*${path.replace('/', '\\/')}</loc>`));
    }
    // 不收录非公开内容
    expect(body).not.toContain('e2e-fixture-draft');
    expect(body).not.toContain('e2e-fixture-tool-draft');
    expect(body).not.toContain('e2e-fixture-product-off');
  });

  test('SEO-003：robots 屏蔽后台、登录与 API', async ({ request }) => {
    const res = await request.get('/robots.txt');
    expect(res.status()).toBe(200);
    const body = await res.text();
    for (const path of ['/studio', '/api', '/login', '/register']) {
      expect(body).toContain(`Disallow: ${path}`);
    }
  });
});

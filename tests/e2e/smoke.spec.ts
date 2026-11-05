import { expect, test } from '@playwright/test';

/**
 * 冒烟用例（SITE-001、A11Y 响应式）：不依赖数据库内容。
 * 无 DATABASE_URL 时公开页渲染空状态，这些断言依然成立。
 */
test.describe('站点冒烟', () => {
  test('首页可访问，包含 Hero 与四板块入口', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/ValuePass/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('让想法');
    await expect(page.getByRole('link', { name: /AI 全栈/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /AI 工具/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /经验分享/ }).first()).toBeVisible();
    await expect(page.getByRole('link', { name: /商品/ }).first()).toBeVisible();
  });

  test('导航可进入各板块列表页', async ({ page, viewport }) => {
    await page.goto('/');
    if (viewport && viewport.width < 1024) {
      await page.getByRole('button', { name: '打开导航菜单' }).click();
      await page.getByRole('navigation', { name: '手机导航' }).getByRole('link', { name: '关于我' }).click();
    } else {
      await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '关于我' }).click();
    }
    await expect(page).toHaveURL(/\/about/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('做出来');
  });

  test('不存在的 URL 返回 404 页（SITE-001）', async ({ page }) => {
    const response = await page.goto('/no-such-page');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('还在路上');
    await expect(page.getByRole('link', { name: '回到首页' })).toBeVisible();
  });

  test('文章列表页显示文章或空状态（SITE-002）', async ({ page }) => {
    await page.goto('/articles');
    // 有内容时显示文章链接，无内容时显示空状态
    const hasArticles = (await page.locator('main a[href^="/articles/"]').count()) > 0;
    if (!hasArticles) {
      await expect(page.getByText('内容筹备中')).toBeVisible();
    }
  });

  test('页面无水平溢出（A11Y 响应式）', async ({ page }) => {
    for (const path of ['/', '/articles', '/tools', '/products', '/about', '/login']) {
      await page.goto(path);
      const overflow = await page.evaluate(
        () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
      );
      expect(overflow, `${path} 出现水平溢出`).toBe(false);
    }
  });

  test('未登录访问后台显示登录页（SEC-001）', async ({ page }) => {
    await page.goto('/studio');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('欢迎回来');
    await expect(page.getByLabel('管理员账号')).toBeVisible();
  });

  test('未登录访问后台子路由被重定向到登录页（SEC-002）', async ({ page }) => {
    await page.goto('/studio/dashboard');
    await expect(page).toHaveURL(/\/studio$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('欢迎回来');
  });

  test('关于页显示微信号', async ({ page }) => {
    await page.goto('/about');
    await expect(page.getByText('dxl20061110')).toBeVisible();
  });
});

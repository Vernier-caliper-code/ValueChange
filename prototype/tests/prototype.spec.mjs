import { test, expect } from '@playwright/test';

const BASE = process.env.BASE_URL || 'http://localhost:4173';

test('桌面前台核心路径与微信弹窗', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto(`${BASE}/`);
  await expect(page.locator('h1')).toContainText('让想法，长成');
  await expect(page.getByRole('navigation', { name: '主导航' })).toBeVisible();
  await page.screenshot({ path: 'screenshots/home-desktop.png', fullPage: true });
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: 'AI全栈', exact: true }).click();
  await expect(page).toHaveURL(/articles.html/);
  await page.locator('.article-row').first().click();
  await expect(page.locator('h1')).toContainText('从 0 到 1');
  await page.getByRole('navigation', { name: '主导航' }).getByRole('link', { name: '商品', exact: true }).click();
  await page.locator('.product-card').first().click();
  await page.getByRole('button', { name: '查看笔记系统地图' }).click();
  await expect(page.locator('[data-gallery-main]')).toHaveAttribute('src', '/assets/architecture.svg');
  await page.getByRole('button', { name: '微信咨询这件作品' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.screenshot({ path: 'screenshots/product-dialog.png' });
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  expect(errors).toEqual([]);
});

test('手机导航、表单校验和后台编辑', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(`${BASE}/`);
  await expect(page.locator('.menu-toggle')).toBeVisible();
  await page.getByRole('button', { name: '打开导航菜单' }).click();
  await expect(page.getByRole('navigation', { name: '手机导航' })).toBeVisible();
  await page.getByRole('navigation', { name: '手机导航' }).getByRole('link', { name: '关于我' }).click();
  await expect(page).toHaveURL(/about.html/);
  await page.screenshot({ path: 'screenshots/about-mobile.png', fullPage: true });
  await page.goto(`${BASE}/auth.html`);
  await page.getByRole('tab', { name: '注册' }).click();
  await page.locator('#username').fill('test_user');
  await page.locator('#password').fill('password123');
  await page.locator('#confirm-password').fill('password456');
  await page.getByRole('button', { name: '注册并登录' }).click();
  await expect(page.getByRole('alert')).toContainText('两次输入的密码不一致');
  await page.goto(`${BASE}/admin/editor.html`);
  await expect(page.locator('#markdown-preview h1')).toContainText('从 0 到 1');
  await page.locator('#markdown-input').fill('# 验证标题\n\n## 验证小节');
  await expect(page.locator('#markdown-preview h2')).toHaveText('验证小节');
  expect(errors).toEqual([]);
});

test('后台筛选、精选和用户禁用', async ({ page }) => {
  await page.goto(`${BASE}/admin/dashboard.html`);
  await expect(page.locator('[data-admin-view="articles"]')).toBeVisible();
  await page.getByRole('button', { name: '草稿', exact: true }).click();
  await expect(page.locator('#article-rows tr:visible')).toHaveCount(1);
  await page.locator('[data-admin-target="users"]').click();
  await page.getByRole('button', { name: '禁用', exact: true }).first().click();
  await expect(page.getByRole('button', { name: '启用', exact: true }).first()).toBeVisible();
  await page.locator('[data-admin-target="featured"]').click();
  await page.getByRole('checkbox', { name: '推荐 AI+X 文章' }).check();
  await expect(page.getByRole('checkbox', { name: '推荐 AI+X 文章' })).toBeChecked();
});

test('主要页面无水平溢出', async ({ page }) => {
  for (const width of [1440, 390, 320]) {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ['/', '/articles.html', '/article.html', '/tools.html', '/tool.html', '/insights.html', '/products.html', '/product.html', '/about.html', '/auth.html', '/admin/dashboard.html', '/admin/editor.html']) {
      await page.goto(`${BASE}${path}`);
      const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
      expect(overflow, `${path} at ${width}px`).toBe(false);
    }
  }
});

/**
 * PRD 验收 E2E（桌面端执行）：
 *  - ADMIN-ART-001/002：后台发布文章 → 前台可见；撤回与删除
 *  - HOME-001 + ADMIN-FEAT-001：精选勾选/取消，首页精选位出现/消失
 *  - TOOL-001/002：工具列表详情与官网外链；草稿展示 404 页
 *  - PROD-001/002/003：商品详情、微信弹窗、下架提示、无交易入口
 *  - ART-002/003、SITE-003、ADMIN-USER-001/002
 */
import { expect, test, type Page } from '@playwright/test';

import { clickAndWaitForAction, logoutUser, registerUser, studioLogin, suffix } from './helpers';

const isMobile = ({ viewport }: { viewport?: { width: number } | null }) =>
  (viewport?.width ?? 1440) < 1024;

const ARTICLE_MD = [
  '## 第一段',
  '',
  '这是**正文**内容，包含代码示例：',
  '',
  '```ts',
  'const a = 1;',
  '```',
  '',
  '<script>alert(1)</script>',
].join('\n');

async function publishArticle(page: Page, title: string, slug: string) {
  await page.goto('/studio/articles/new');
  await page.getByPlaceholder('输入文章标题').fill(title);
  await page.getByPlaceholder('my-article-slug').fill(slug);
  await page.getByPlaceholder(/Markdown 语法/).fill(ARTICLE_MD);
  // 远端测试库写入 + 多路径 revalidate 偶发较慢：先等 Server Action 响应，再等跳转
  await clickAndWaitForAction(page, page.getByRole('button', { name: '发布文章' }));
  await expect(page).toHaveURL(/\/studio\/articles$/, { timeout: 30_000 });
}

test.describe('PRD 验收：后台发布与前台展示', () => {
  test('ADMIN-ART-001 + ART-001/002/004：发布文章后前台列表与详情可见并正确渲染', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '后台流程仅桌面端执行');
    const run = suffix();
    const title = `E2E 发布测试 ${run}`;
    const slug = `e2e-run-${run}`;
    await studioLogin(page);
    await publishArticle(page, title, slug);

    // 前台列表可见
    await page.goto('/articles');
    await expect(page.getByText(title, { exact: true })).toBeVisible();

    // 详情页：标题、目录标题、阅读时长、返回链接、JSON-LD
    await page.goto(`/articles/${slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.getByRole('heading', { level: 2, name: '第一段' })).toBeVisible();
    await expect(page.getByText('分钟阅读')).toBeVisible();
    await expect(page.getByRole('link', { name: '← 返回AI 全栈' })).toBeVisible();
    // 原始 HTML / script 被清洗
    await expect(page.locator('article')).not.toContainText('alert(1)');
    const ld = page.locator('script[type="application/ld+json"]');
    await expect(ld).toHaveCount(1);
    const ldText = (await ld.first().textContent()) ?? '';
    expect(ldText).toContain('"@type":"Article"');
    expect(ldText).toContain(title);
  });

  test('ADMIN-ART-002：撤回后前台展示 404 页，删除经确认弹窗移除', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '后台流程仅桌面端执行');
    const run = suffix();
    const title = `E2E 发布测试 ${run}`;
    const slug = `e2e-run-${run}`;
    await studioLogin(page);
    await publishArticle(page, title, slug);

    // 撤回 → 列表状态变草稿，前台列表与详情不再可见
    await page.goto('/studio/articles');
    const row = page.getByRole('row', { name: new RegExp(title) });
    await clickAndWaitForAction(page, row.getByRole('button', { name: '撤回' }));
    await page.reload();
    await expect(page.getByRole('row', { name: new RegExp(title) })).toContainText('草稿');
    await page.goto('/articles');
    await expect(page.getByText(title, { exact: true })).toHaveCount(0);
    await page.goto(`/articles/${slug}`);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('还在路上');

    // 删除 → 确认弹窗 → 列表移除
    await page.goto('/studio/articles');
    await page.getByRole('row', { name: new RegExp(title) }).getByRole('button', { name: '删除' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toContainText('删除后无法恢复');
    await clickAndWaitForAction(page, dialog.getByRole('button', { name: '确认删除' }));
    await page.reload();
    await expect(page.getByRole('row', { name: new RegExp(title) })).toHaveCount(0);
  });

  test('HOME-001 + ADMIN-FEAT-001：勾选精选后首页精选位切换，取消后回退最新', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '后台流程仅桌面端执行');
    const run = suffix();
    const title = `E2E 发布测试 ${run}`;
    await studioLogin(page);
    await publishArticle(page, title, `e2e-run-${run}`);

    const featured = page.locator('section[aria-labelledby="featured-title"]');
    // 初始无精选：首页精选区兜底展示最新文章（含刚发布的内容）
    await page.goto('/');
    await expect(featured.getByText(title, { exact: true })).toBeVisible();

    // 勾选夹具文章为精选 → 首页精选位只展示精选内容，新文章退位
    await page.goto('/studio/featured');
    const row = page.getByText('E2E 夹具文章', { exact: true }).locator('..').locator('..');
    await clickAndWaitForAction(page, row.getByRole('checkbox'));
    await page.goto('/');
    await expect(featured.getByText('E2E 夹具文章', { exact: true })).toBeVisible();
    await expect(featured.getByText(title, { exact: true })).toHaveCount(0);

    // 取消勾选 → 回退到最新文章
    await page.goto('/studio/featured');
    const row2 = page.getByText('E2E 夹具文章', { exact: true }).locator('..').locator('..');
    await expect(row2.getByRole('checkbox')).toBeChecked();
    await clickAndWaitForAction(page, row2.getByRole('checkbox'));
    await page.goto('/');
    await expect(featured.getByText(title, { exact: true })).toBeVisible();
  });

  test('TOOL-001/002：工具详情完整、官网新窗口打开，草稿展示 404 页', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '后台流程仅桌面端执行');
    await page.goto('/tools');
    await expect(page.getByText('E2E 夹具工具', { exact: true })).toBeVisible();
    await expect(page.getByText('E2E 夹具工具草稿')).toHaveCount(0);

    // dev 模式按需编译详情路由较慢，点击后等待导航完成
    await page.getByRole('link', { name: /E2E 夹具工具/ }).first().click();
    await expect(page).toHaveURL(/\/tools\/e2e-fixture-tool$/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('E2E 夹具工具');
    await expect(page.getByText('夹具工具的一句话摘要。')).toBeVisible();

    const siteLink = page.getByRole('link', { name: /前往 E2E 夹具工具 官网/ });
    await expect(siteLink).toHaveAttribute('href', 'https://example.com');
    await expect(siteLink).toHaveAttribute('target', '_blank');
    await expect(siteLink).toHaveAttribute('rel', /noopener noreferrer/);

    await page.goto('/tools/e2e-fixture-tool-draft');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('还在路上');
  });

  test('PROD-001/003：商品详情展示图文，微信弹窗含二维码与微信号，无交易入口', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '后台流程仅桌面端执行');
    await page.goto('/products');
    await expect(page.getByText('E2E 夹具商品', { exact: true })).toBeVisible();
    await expect(page.getByText('E2E 下架商品')).toHaveCount(0);

    await page.getByRole('link', { name: /E2E 夹具商品/ }).first().click();
    await expect(page).toHaveURL(/\/products\/e2e-fixture-product$/, { timeout: 30_000 });
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('E2E 夹具商品');
    await expect(page.getByAltText(/E2E 夹具商品/).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /购买|购物车|支付|下单/ })).toHaveCount(0);

    await page.getByRole('button', { name: /微信咨询这件作品/ }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog.getByAltText('站长微信二维码')).toBeVisible();
    await expect(dialog.getByText('aaa1024-__-')).toBeVisible();
    await expect(dialog.getByRole('button', { name: '复制' })).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('PROD-002：下架商品访问旧链接显示提示、推荐与 noindex', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '后台流程仅桌面端执行');
    await page.goto('/products/e2e-fixture-product-off');
    await expect(page.getByText('该商品已下架')).toBeVisible();
    await expect(page.getByRole('link', { name: /浏览其他商品/ })).toBeVisible();
    await expect(page.getByRole('region', { name: '其他商品' }).getByText('E2E 夹具商品')).toBeVisible();
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('ART-003：草稿文章访问展示 404 页', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '后台流程仅桌面端执行');
    await page.goto('/articles/e2e-fixture-draft');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('还在路上');
    await expect(page.getByRole('link', { name: /回到首页/ })).toBeVisible();
  });

  // 上游缺陷跟踪：动态路由 notFound 应返回真实 404 HTTP 状态码。
  // Next.js 15.5 在 Suspense 边界/动态参数场景下返回 200（vercel/next.js#99343、#99318，未修复），
  // 上游修复后该用例自动转绿。
  test('SITE-004：动态路由 404 返回真实 404 状态码（跟踪 vercel/next.js#99343）', async ({ page }) => {
    test.fail(true, '上游缺陷：Next.js 15.5 动态路由 notFound 状态码返回 200（vercel/next.js#99343）');
    const article = await page.goto('/articles/e2e-fixture-draft');
    expect(article?.status()).toBe(404);
    const tool = await page.goto('/tools/e2e-fixture-tool-draft');
    expect(tool?.status()).toBe(404);
  });

  test('SITE-003：无内容板块显示空状态占位', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use));
    await page.goto('/insights');
    await expect(page.getByText('内容筹备中')).toBeVisible();
  });

  test('ADMIN-USER-001/002：后台禁用用户阻止登录，重置密码后可用新密码登录', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '后台流程仅桌面端执行');
    const username = `e2e_user_${suffix()}`;
    await registerUser(page, username);

    // 管理员重置密码
    await page.context().clearCookies();
    await studioLogin(page);
    await page.goto('/studio/users');
    const row = page.getByRole('row', { name: new RegExp(username) });
    await expect(row).toBeVisible();
    await row.getByRole('button', { name: '重置密码' }).click();
    await row.getByPlaceholder('新密码（8~72 位）').fill('newpass123');
    await clickAndWaitForAction(page, row.getByRole('button', { name: '确认' }));

    // 新密码可登录
    await page.context().clearCookies();
    await page.goto('/login');
    await page.getByLabel('账号', { exact: true }).fill(username);
    await page.getByLabel('密码', { exact: true }).fill('newpass123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.getByText(username, { exact: true })).toBeVisible();

    // 管理员禁用该用户
    await logoutUser(page);
    await studioLogin(page);
    await page.goto('/studio/users');
    const row2 = page.getByRole('row', { name: new RegExp(username) });
    await clickAndWaitForAction(page, row2.getByRole('button', { name: '禁用' }));
    await page.reload();
    await expect(page.getByRole('row', { name: new RegExp(username) })).toContainText('已禁用');

    // 被禁用账号无法登录
    await page.context().clearCookies();
    await page.goto('/login');
    await page.getByLabel('账号', { exact: true }).fill(username);
    await page.getByLabel('密码', { exact: true }).fill('newpass123');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('该账号已被禁用，请联系站长')).toBeVisible();
  });
});





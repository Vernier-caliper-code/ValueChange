/**
 * 认证 E2E（AUTH-001 ~ AUTH-011、SEC-003）。
 * 仅在桌面项目执行：登录态仅桌面导航可见，避免移动端重复写测试库。
 */
import { expect, test } from '@playwright/test';

import { logoutUser, registerUser, suffix } from './helpers';

const isMobile = ({ viewport }: { viewport?: { width: number } | null }) =>
  (viewport?.width ?? 1440) < 1024;

async function fillLogin(page: import('@playwright/test').Page, username: string, password: string) {
  await page.getByLabel('账号', { exact: true }).fill(username);
  await page.getByLabel('密码', { exact: true }).fill(password);
}

test.describe('认证流程', () => {
  test('AUTH-001/004/007：注册成功并自动登录，Cookie 与 /api/auth/me 正确', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    const username = `e2e_reg_${suffix()}`;
    await registerUser(page, username);

    await expect(page).toHaveURL('/');
    await expect(page.locator('header').getByText(username, { exact: true }).first()).toBeVisible();

    const cookie = (await page.context().cookies()).find((c) => c.name === 'vp_session');
    expect(cookie?.httpOnly).toBe(true);
    expect(cookie?.sameSite).toBe('Lax');

    const me = await page.request.get('/api/auth/me');
    const meBody = (await me.json()) as { user: { username: string } | null };
    expect(meBody.user?.username).toBe(username);
  });

  test('AUTH-002：用户名重复注册显示明确提示', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    const username = `e2e_dup_${suffix()}`;
    await registerUser(page, username);
    await expect(page).toHaveURL('/');

    // 登录状态下访问 /register 会被重定向，先退出
    await logoutUser(page);
    await page.goto('/register');
    await fillLogin(page, username, 'password8');
    await page.getByLabel('确认密码').fill('password8');
    await page.getByRole('button', { name: '注册' }).click();
    await expect(page.getByText('该用户名已被使用')).toBeVisible();
  });

  test('AUTH-003：密码过短与两次输入不一致的字段级提示', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    await page.goto('/register');
    await page.getByLabel('账号', { exact: true }).fill(`e2e_val_${suffix()}`);
    await page.getByLabel('密码', { exact: true }).fill('short7');
    await page.getByLabel('确认密码').fill('short7');
    await page.getByRole('button', { name: '注册' }).click();
    await expect(page.getByText('密码至少需要 8 位字符')).toBeVisible();

    await page.getByLabel('密码', { exact: true }).fill('password8');
    await page.getByLabel('确认密码').fill('password9');
    await page.getByRole('button', { name: '注册' }).click();
    await expect(page.getByText('两次输入的密码不一致')).toBeVisible();
  });

  test('AUTH-005：账号不存在与密码错误统一提示，成功后 Header 显示用户名', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    const username = `e2e_login_${suffix()}`;
    await registerUser(page, username);
    await logoutUser(page);

    await page.goto('/login');
    await fillLogin(page, 'nobody_exists', 'whatever88');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('账号或密码错误')).toBeVisible();

    await fillLogin(page, username, 'wrong-pass12');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('账号或密码错误')).toBeVisible();

    await fillLogin(page, username, 'password8');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL('/');
    await expect(page.locator('header').getByText(username, { exact: true }).first()).toBeVisible();
  });

  test('AUTH-006：连续 5 次失败锁定 15 分钟', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    const username = `e2e_lock_${suffix()}`;
    await registerUser(page, username);
    await logoutUser(page);

    await page.goto('/login');
    for (let i = 0; i < 4; i += 1) {
      await fillLogin(page, username, 'wrong-pass12');
      await page.getByRole('button', { name: '登录' }).click();
      await expect(page.getByText('账号或密码错误')).toBeVisible();
    }
    // 第 5 次失败触发锁定
    await fillLogin(page, username, 'wrong-pass12');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('尝试次数过多，请 15 分钟后再试')).toBeVisible();

    // 锁定期间即使密码正确也被拒绝
    await fillLogin(page, username, 'password8');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('尝试次数过多，请 15 分钟后再试')).toBeVisible();
  });

  test('AUTH-007：禁用账号无法登录', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    await page.goto('/login');
    await fillLogin(page, 'e2e_disabled', 'password8');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page.getByText('该账号已被禁用，请联系站长')).toBeVisible();
  });

  test('AUTH-008：退出登录后会话失效', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    const username = `e2e_logout_${suffix()}`;
    await registerUser(page, username);
    await logoutUser(page);
    await expect(page.getByRole('link', { name: '登录' }).first()).toBeVisible();

    const me = await page.request.get('/api/auth/me');
    const meBody = (await me.json()) as { user: { username: string } | null };
    expect(meBody.user).toBeNull();
  });

  test('AUTH-010：redirectTo 外部地址被降级为站内首页', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    const username = `e2e_redir_${suffix()}`;
    await registerUser(page, username);
    await logoutUser(page);

    await page.goto('/login?redirectTo=https://evil.example.com/path');
    await fillLogin(page, username, 'password8');
    await page.getByRole('button', { name: '登录' }).click();
    await expect(page).toHaveURL(/localhost:3200\/$/);
  });

  test('SEC-003：普通用户访问后台子路由仍被拒绝', async ({ page }, testInfo) => {
    test.skip(isMobile(testInfo.project.use), '登录态仅桌面导航可见');
    const username = `e2e_panel_${suffix()}`;
    await registerUser(page, username);
    await page.goto('/studio/dashboard');
    await expect(page).toHaveURL(/\/studio$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('欢迎回来，创作者');
  });
});


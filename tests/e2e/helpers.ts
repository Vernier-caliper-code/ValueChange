import { expect, type Locator, type Page } from '@playwright/test';

/** 生成唯一后缀，避免用例之间与多次运行之间互相干扰。 */
export function suffix(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`;
}

/** 通过前台注册页创建并登录普通用户。 */
export async function registerUser(page: Page, username: string, password = 'password8') {
  await page.goto('/register');
  await page.getByLabel('账号', { exact: true }).fill(username);
  await page.getByLabel('密码', { exact: true }).fill(password);
  await page.getByLabel('确认密码').fill(password);
  await page.getByRole('button', { name: '注册' }).click();
}

/** 使用 .env.local 中的管理员账号登录 Studio。 */
export async function studioLogin(page: Page) {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (!username || !password) throw new Error('缺少 ADMIN_USERNAME / ADMIN_PASSWORD');

  await page.goto('/studio');
  await page.getByLabel('管理员账号').fill(username);
  await page.getByLabel('密码').fill(password);
  await page.getByRole('button', { name: '登录管理后台' }).click();
  await expect(page).toHaveURL(/\/studio\/dashboard/);
}

/** 点击触发 Server Action 的控件，并等待对应 POST 请求完成。 */
export async function clickAndWaitForAction(page: Page, locator: Locator) {
  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.request().method() === 'POST' && !res.url().includes('/_next/'),
    ),
    locator.click(),
  ]);
  expect(response.ok()).toBeTruthy();
}

/** 退出登录并等待 UI 恢复未登录状态，避免登出竞态。 */
export async function logoutUser(page: Page) {
  await page.getByRole('button', { name: '退出' }).click();
  await expect(page.getByRole('link', { name: '登录' }).first()).toBeVisible();
}


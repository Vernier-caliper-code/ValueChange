import { defineConfig } from '@playwright/test';

// 加载 .env.local 与 .env
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // 文件不存在时忽略
  }
}

if (!process.env.TEST_DATABASE_URL) {
  throw new Error('E2E 必须配置 TEST_DATABASE_URL 指向独立测试数据库');
}
// E2E 期间所有数据库读写一律指向测试库（子进程 dev server 继承本环境变量）
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 90_000,
  expect: { timeout: 10_000 },
  retries: 0,
  workers: 1,
  globalSetup: './tests/e2e/global-setup.ts',
  use: {
    baseURL: 'http://localhost:3200',
    locale: 'zh-CN',
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1440, height: 900 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
  // E2E 使用生产构建（build 后立即 start），避免 dev 按需编译带来的不确定性与卡死；
  // 数据库一律指向 TEST_DATABASE_URL（见顶部注入），写操作只落在测试库。
  webServer: {
    command: 'npm run build && npm run start -- -p 3200',
    url: 'http://localhost:3200',
    reuseExistingServer: false,
    timeout: 240_000,
  },
});



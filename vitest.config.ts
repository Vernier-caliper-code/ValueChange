import path from 'node:path';
import { defineConfig } from 'vitest/config';

// 加载 .env.local 与 .env，供集成测试使用 TEST_DATABASE_URL
for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // 文件不存在时忽略
  }
}

export default defineConfig({
  test: {
    environment: 'node',
    include: ['tests/**/*.test.{ts,tsx}'],
    // 集成测试连接远端测试库，并行执行时单次往返可能超过默认 5s
    testTimeout: 15_000,
    server: {
      deps: {
        inline: ['highlight.js'],
        external: [/.*\.css$/],
      },
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
});

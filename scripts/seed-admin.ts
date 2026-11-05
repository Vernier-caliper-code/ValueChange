/**
 * 一次性管理员种子脚本：npm run db:seed:admin
 *
 * - 读取环境变量 ADMIN_USERNAME / ADMIN_PASSWORD（优先 .env.local，其次 .env）
 * - 已存在同名 ADMIN 时，仅 --force 允许更新密码
 * - 已存在同名普通用户时中止，避免误提权
 * - 不把明文密码写入任何文件或日志
 */
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import { hashPassword } from '../src/lib/auth/password';
import * as schema from '../src/lib/db/schema';
import { passwordSchema, usernameSchema } from '../src/lib/validation/auth';

for (const file of ['.env.local', '.env']) {
  try {
    process.loadEnvFile(file);
  } catch {
    // 文件不存在时忽略
  }
}

async function main() {
  const force = process.argv.slice(2).includes('--force');
  const usernameRaw = process.env.ADMIN_USERNAME;
  const passwordRaw = process.env.ADMIN_PASSWORD;

  if (!usernameRaw || !passwordRaw) {
    console.error('缺少 ADMIN_USERNAME 或 ADMIN_PASSWORD 环境变量');
    process.exit(1);
  }
  if (!process.env.DATABASE_URL) {
    console.error('缺少 DATABASE_URL 环境变量');
    process.exit(1);
  }

  const username = usernameSchema.safeParse(usernameRaw);
  if (!username.success) {
    console.error(`ADMIN_USERNAME 不合法：${username.error.issues[0]?.message}`);
    process.exit(1);
  }
  const password = passwordSchema.safeParse(passwordRaw);
  if (!password.success) {
    console.error(`ADMIN_PASSWORD 不合法：${password.error.issues[0]?.message}`);
    process.exit(1);
  }

  const client = postgres(process.env.DATABASE_URL, { max: 1, prepare: false });
  const db = drizzle(client, { schema });

  try {
    const rows = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username.data))
      .limit(1);
    const existing = rows[0];

    if (existing && existing.role !== 'ADMIN') {
      console.error('已存在同名普通用户，为避免误提权已中止。请更换 ADMIN_USERNAME 或手动处理。');
      process.exit(1);
    }

    const passwordHash = await hashPassword(password.data);

    if (existing) {
      if (!force) {
        console.error('同名管理员已存在。如需重置密码，请加 --force 重试。');
        process.exit(1);
      }
      await db
        .update(schema.users)
        .set({ passwordHash, updatedAt: new Date() })
        .where(eq(schema.users.id, existing.id));
      console.log(`管理员 ${username.data} 密码已更新`);
    } else {
      await db.insert(schema.users).values({
        username: username.data,
        passwordHash,
        role: 'ADMIN',
      });
      console.log(`管理员 ${username.data} 创建成功`);
    }
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error('种子脚本执行失败：', error instanceof Error ? error.message : error);
  process.exit(1);
});

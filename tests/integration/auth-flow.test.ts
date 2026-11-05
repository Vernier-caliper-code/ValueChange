/**
 * 认证流程集成测试（AUTH-001 ~ AUTH-004 的集成部分）。
 *
 * 运行前提：
 *   1. 设置 TEST_DATABASE_URL 指向独立的测试数据库（禁止生产库）；
 *   2. 测试会自动应用 drizzle/ 下的迁移 SQL，并在结束后清空业务数据。
 * 未设置 TEST_DATABASE_URL 时本文件自动跳过。
 */
import { eq } from 'drizzle-orm';
import { drizzle, type PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import {
  buildAttemptKey,
  isLoginLocked,
} from '@/lib/auth/login-policy';
import { recordLoginFailure } from '@/lib/auth/login-attempts';
import { hashPassword, verifyPassword } from '@/lib/auth/password';
import {
  createSession,
  deleteSessionByToken,
  deleteUserSessions,
  findUserBySessionToken,
} from '@/lib/auth/session';
import { createUser, findUserByUsername } from '@/lib/auth/users';
import * as schema from '@/lib/db/schema';

const DATABASE_URL = process.env.TEST_DATABASE_URL;
const run = DATABASE_URL ? describe : describe.skip;

let client: postgres.Sql;
let db: PostgresJsDatabase<typeof schema>;

run('认证流程（集成）', () => {
  beforeAll(async () => {
    // 被测的 lib 函数通过 getDb() 读取 DATABASE_URL，这里对齐到测试库
    process.env.DATABASE_URL = DATABASE_URL;
    client = postgres(DATABASE_URL!, { max: 1, prepare: false });
    db = drizzle(client, { schema });

    // 应用迁移
    const drizzleDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../drizzle');
    const migrations = fs
      .readdirSync(drizzleDir)
      .filter((f) => f.endsWith('.sql'))
      .sort();
    for (const file of migrations) {
      await client.file(path.join(drizzleDir, file));
    }
    // 清空数据，保证用例独立
    await db.delete(schema.sessions);
    await db.delete(schema.authAttempts);
    await db.delete(schema.users);
  }, 60_000);

  afterAll(async () => {
    await client?.end();
  });

  it('注册后可登录，密码以哈希存储', async () => {
    const user = await createUser({
      username: 'user_active',
      passwordHash: await hashPassword('password8'),
    });
    const found = await findUserByUsername('user_active');
    expect(found?.id).toBe(user.id);
    expect(found?.passwordHash).not.toContain('password8');
    await expect(verifyPassword('password8', found!.passwordHash)).resolves.toBe(true);
  });

  it('会话创建/查询/删除闭环', async () => {
    const user = (await findUserByUsername('user_active'))!;
    const { token } = await createSession(user.id);

    const current = await findUserBySessionToken(token);
    expect(current?.username).toBe('user_active');

    await deleteSessionByToken(token);
    expect(await findUserBySessionToken(token)).toBeNull();
  });

  it(`连续 5 次失败后锁定`, async () => {
    const key = buildAttemptKey('user_active', '10.0.0.1');
    for (let i = 0; i < 4; i += 1) {
      expect((await recordLoginFailure(key)).locked).toBe(false);
    }
    expect((await recordLoginFailure(key)).locked).toBe(true);

    const row = await db.query.authAttempts.findFirst({
      where: eq(schema.authAttempts.key, key),
    });
    expect(isLoginLocked(row?.lockedUntil)).toBe(true);
  });

  it('禁用用户后其会话立即失效', async () => {
    const user = await createUser({
      username: 'user_disabled',
      passwordHash: await hashPassword('password8'),
    });
    const { token } = await createSession(user.id);
    expect(await findUserBySessionToken(token)).not.toBeNull();

    await db
      .update(schema.users)
      .set({ status: 'DISABLED' })
      .where(eq(schema.users.id, user.id));
    expect(await findUserBySessionToken(token)).toBeNull();

    // 清理：恢复数据供其他用例使用
    await deleteUserSessions(user.id);
  });
});

import { eq, lt, sql } from 'drizzle-orm';

import { getDb, schema } from '@/lib/db';
import { LOGIN_MAX_FAILURES, nextFailureState } from './login-policy';

export async function getLoginAttempt(key: string) {
  const rows = await getDb()
    .select()
    .from(schema.authAttempts)
    .where(eq(schema.authAttempts.key, key))
    .limit(1);
  return rows[0] ?? null;
}

/** 记录一次失败；返回本次失败后是否进入锁定。 */
export async function recordLoginFailure(key: string): Promise<{ locked: boolean }> {
  const db = getDb();
  const rows = await db
    .insert(schema.authAttempts)
    .values({ key, failedCount: 1 })
    .onConflictDoUpdate({
      target: schema.authAttempts.key,
      set: {
        failedCount: sql`${schema.authAttempts.failedCount} + 1`,
        updatedAt: new Date(),
      },
    })
    .returning({ failedCount: schema.authAttempts.failedCount });

  const failedCount = rows[0]?.failedCount ?? 1;
  if (failedCount < LOGIN_MAX_FAILURES) return { locked: false };

  const { lockedUntil } = nextFailureState(failedCount - 1);
  await db
    .update(schema.authAttempts)
    .set({ lockedUntil, updatedAt: new Date() })
    .where(eq(schema.authAttempts.key, key));
  return { locked: true };
}

export async function clearLoginAttempts(key: string): Promise<void> {
  await getDb().delete(schema.authAttempts).where(eq(schema.authAttempts.key, key));
}

/** 顺带清理 24 小时前的限流记录。 */
export async function cleanupLoginAttempts(): Promise<void> {
  const cutoff = new Date(Date.now() - 24 * 60 * 60 * 1000);
  await getDb().delete(schema.authAttempts).where(lt(schema.authAttempts.updatedAt, cutoff));
}

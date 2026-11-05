import { eq, lt } from 'drizzle-orm';

import { getDb, schema } from '@/lib/db';
import { generateSessionToken, hashSessionToken } from './token';
import type { UserRecord } from './users';

export const SESSION_COOKIE_NAME = 'vp_session';
export const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

export function getSessionCookieOptions(expiresAt: Date) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax' as const,
    path: '/',
    expires: expiresAt,
  };
}

export async function createSession(userId: string): Promise<{ token: string; expiresAt: Date }> {
  const token = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await getDb().insert(schema.sessions).values({
    userId,
    tokenHash: hashSessionToken(token),
    expiresAt,
  });
  return { token, expiresAt };
}

/** 凭原始 Token 查当前用户；过期会话与禁用用户一律视为未登录并清理。 */
export async function findUserBySessionToken(token: string): Promise<UserRecord | null> {
  const db = getDb();
  const rows = await db
    .select({ session: schema.sessions, user: schema.users })
    .from(schema.sessions)
    .innerJoin(schema.users, eq(schema.sessions.userId, schema.users.id))
    .where(eq(schema.sessions.tokenHash, hashSessionToken(token)))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  if (row.session.expiresAt.getTime() <= Date.now()) {
    await db.delete(schema.sessions).where(eq(schema.sessions.id, row.session.id));
    return null;
  }
  if (row.user.status !== 'ACTIVE') {
    await db.delete(schema.sessions).where(eq(schema.sessions.userId, row.user.id));
    return null;
  }
  return row.user;
}

export async function deleteSessionByToken(token: string): Promise<void> {
  await getDb()
    .delete(schema.sessions)
    .where(eq(schema.sessions.tokenHash, hashSessionToken(token)));
}

export async function deleteUserSessions(userId: string): Promise<void> {
  await getDb().delete(schema.sessions).where(eq(schema.sessions.userId, userId));
}

export async function deleteExpiredSessions(): Promise<void> {
  await getDb().delete(schema.sessions).where(lt(schema.sessions.expiresAt, new Date()));
}

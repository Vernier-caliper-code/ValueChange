'use server';

import { requireAdmin } from '@/lib/auth/guards';
import { getDb, schema } from '@/lib/db';
import { eq } from 'drizzle-orm';
import { fail, ok, type ActionResult } from '@/lib/utils/result';
import { hashPassword } from '@/lib/auth/password';
import { deleteUserSessions } from '@/lib/auth/session';
import { passwordSchema } from '@/lib/validation/auth';

export async function listUsersAction(query?: string, status?: 'ACTIVE' | 'DISABLED') {
  const gate = await requireAdmin();
  if (!gate.ok) throw new Error('UNAUTHORIZED');

  const db = getDb();
  const all = await db.select().from(schema.users).orderBy(schema.users.createdAt);
  return all.filter((user) => {
    if (query && !user.username.includes(query.toLowerCase())) return false;
    if (status && user.status !== status) return false;
    return true;
  });
}

export async function setUserStatusAction(userId: string, status: 'ACTIVE' | 'DISABLED'): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;
  if (userId === gate.user.id) return fail('VALIDATION_ERROR', { message: '不能修改自己的状态' });

  const db = getDb();
  await db.update(schema.users).set({ status, updatedAt: new Date() }).where(eq(schema.users.id, userId));
  if (status === 'DISABLED') await deleteUserSessions(userId);
  return ok();
}

export async function resetUserPasswordAction(userId: string, newPassword: string): Promise<ActionResult> {
  const gate = await requireAdmin();
  if (!gate.ok) return gate.result;
  if (userId === gate.user.id) return fail('VALIDATION_ERROR', { message: '不能重置自己的密码' });

  const parsed = passwordSchema.safeParse(newPassword);
  if (!parsed.success) return fail('VALIDATION_ERROR', { message: parsed.error.issues[0]?.message });

  const db = getDb();
  const passwordHash = await hashPassword(newPassword);
  await db.update(schema.users).set({ passwordHash, updatedAt: new Date() }).where(eq(schema.users.id, userId));
  await deleteUserSessions(userId);
  return ok();
}

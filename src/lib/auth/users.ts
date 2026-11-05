import { eq } from 'drizzle-orm';

import { getDb, schema } from '@/lib/db';

export type UserRecord = typeof schema.users.$inferSelect;

export async function findUserByUsername(username: string): Promise<UserRecord | null> {
  const rows = await getDb()
    .select()
    .from(schema.users)
    .where(eq(schema.users.username, username))
    .limit(1);
  return rows[0] ?? null;
}

export async function createUser(input: {
  username: string;
  passwordHash: string;
  role?: 'USER' | 'ADMIN';
}): Promise<UserRecord> {
  const rows = await getDb()
    .insert(schema.users)
    .values({
      username: input.username,
      passwordHash: input.passwordHash,
      role: input.role ?? 'USER',
    })
    .returning();
  return rows[0];
}

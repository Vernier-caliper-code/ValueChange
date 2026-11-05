import { cookies } from 'next/headers';

import { SESSION_COOKIE_NAME, findUserBySessionToken } from './session';
import type { UserRecord } from './users';

export type CurrentUser = Pick<UserRecord, 'id' | 'username' | 'role'>;

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const user = await findUserBySessionToken(token);
  if (!user) return null;
  return { id: user.id, username: user.username, role: user.role };
}

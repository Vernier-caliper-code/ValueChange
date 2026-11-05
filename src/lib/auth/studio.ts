import { getCurrentUser } from './current-user';

export async function requireStudioAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') return null;
  return user;
}

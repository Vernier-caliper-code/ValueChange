import { getCurrentUser, type CurrentUser } from './current-user';
import { fail, type ActionResult } from '@/lib/utils/result';

export async function requireUser(): Promise<
  { ok: true; user: CurrentUser } | { ok: false; result: ActionResult<never> }
> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, result: fail('UNAUTHORIZED') };
  return { ok: true, user };
}

export async function requireAdmin(): Promise<
  { ok: true; user: CurrentUser } | { ok: false; result: ActionResult<never> }
> {
  const gate = await requireUser();
  if (!gate.ok) return gate;
  if (gate.user.role !== 'ADMIN') return { ok: false, result: fail('FORBIDDEN') };
  return gate;
}

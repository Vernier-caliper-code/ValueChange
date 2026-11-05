import { getCurrentUser } from '@/lib/auth/current-user';

export async function GET() {
  const user = await getCurrentUser();
  return Response.json(
    { user: user ? { id: user.id, username: user.username } : null },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}

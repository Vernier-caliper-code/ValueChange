import { listUsersAction } from '@/lib/actions/users';
import { UserManager } from '@/components/forms/user-manager';

export default async function StudioUsersPage() {
  const users = await listUsersAction();

  return (
    <div>
      <h2 className="mb-6 text-[20px] font-bold">用户管理</h2>
      <p className="mb-6 text-[14px] text-muted">查看注册账号，处理异常账号与密码重置请求。</p>
      <UserManager users={users} />
    </div>
  );
}

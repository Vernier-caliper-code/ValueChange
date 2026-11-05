'use client';

import { useState } from 'react';

import { setUserStatusAction, resetUserPasswordAction } from '@/lib/actions/users';
import { buttonStyles } from '@/components/ui/button';

type User = {
  id: string;
  username: string;
  status: 'ACTIVE' | 'DISABLED';
  createdAt: Date;
};

export function UserManager({ users }: { users: User[] }) {
  const [pending, setPending] = useState<string | null>(null);
  const [resetUserId, setResetUserId] = useState<string | null>(null);
  const [newPassword, setNewPassword] = useState('');

  async function handleToggleStatus(userId: string, currentStatus: 'ACTIVE' | 'DISABLED') {
    setPending(userId);
    try {
      await setUserStatusAction(userId, currentStatus === 'ACTIVE' ? 'DISABLED' : 'ACTIVE');
    } finally {
      setPending(null);
    }
  }

  async function handleResetPassword(userId: string) {
    setPending(userId);
    try {
      await resetUserPasswordAction(userId, newPassword);
      setResetUserId(null);
      setNewPassword('');
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-lg border border-line bg-white">
      <table className="w-full">
        <thead className="border-b border-line">
          <tr>
            <th className="px-4 py-3 text-left text-[13px] font-medium">账号</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium">注册时间</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium">状态</th>
            <th className="px-4 py-3 text-left text-[13px] font-medium">操作</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className="border-b border-line last:border-0">
              <td className="px-4 py-3 text-[14px]">{user.username}</td>
              <td className="px-4 py-3 text-[13px] text-muted">
                {new Date(user.createdAt).toLocaleDateString('zh-CN')}
              </td>
              <td className="px-4 py-3">
                <span className={`rounded-full px-2 py-1 text-[11px] ${user.status === 'ACTIVE' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {user.status === 'ACTIVE' ? '正常' : '已禁用'}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => handleToggleStatus(user.id, user.status)}
                    disabled={pending === user.id}
                    className="text-[13px] text-brand hover:underline disabled:opacity-50"
                  >
                    {user.status === 'ACTIVE' ? '禁用' : '启用'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setResetUserId(user.id)}
                    className="text-[13px] text-brand hover:underline"
                  >
                    重置密码
                  </button>
                </div>
                {resetUserId === user.id ? (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="新密码（8~72 位）"
                      className="h-9 rounded-md border border-line px-3 text-[13px] outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => handleResetPassword(user.id)}
                      disabled={pending === user.id}
                      className={buttonStyles({ size: 'sm' })}
                    >
                      确认
                    </button>
                    <button
                      type="button"
                      onClick={() => setResetUserId(null)}
                      className={buttonStyles({ variant: 'secondary', size: 'sm' })}
                    >
                      取消
                    </button>
                  </div>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

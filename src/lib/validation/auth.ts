import { z } from 'zod';

export const usernameSchema = z
  .string()
  .trim()
  .transform((s) => s.toLowerCase())
  .pipe(
    z
      .string()
      .min(3, '账号至少 3 位')
      .max(32, '账号最多 32 位')
      .regex(/^[a-z0-9_]+$/, '账号只能包含字母、数字和下划线'),
  );

export const passwordSchema = z
  .string()
  .min(8, '密码至少需要 8 位字符')
  .max(72, '密码最多 72 位字符');

export const registerSchema = z
  .object({
    username: usernameSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((v) => v.password === v.confirmPassword, {
    message: '两次输入的密码不一致',
    path: ['confirmPassword'],
  });

export const loginSchema = z.object({
  username: usernameSchema,
  password: z.string().min(1, '请输入密码'),
  redirectTo: z.string().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;

export const ERROR_CODES = [
  'VALIDATION_ERROR',
  'AUTH_INVALID_CREDENTIALS',
  'AUTH_LOCKED',
  'AUTH_USERNAME_TAKEN',
  'AUTH_DISABLED',
  'UNAUTHORIZED',
  'FORBIDDEN',
  'UPLOAD_TOO_LARGE',
  'UPLOAD_TYPE_INVALID',
  'NOT_FOUND',
  'INTERNAL_ERROR',
] as const;

export type ErrorCode = (typeof ERROR_CODES)[number];

export const ERROR_MESSAGES: Record<ErrorCode, string> = {
  VALIDATION_ERROR: '请检查填写内容',
  AUTH_INVALID_CREDENTIALS: '账号或密码错误',
  AUTH_LOCKED: '尝试次数过多，请 15 分钟后再试',
  AUTH_USERNAME_TAKEN: '该用户名已被使用',
  AUTH_DISABLED: '该账号已被禁用，请联系站长',
  UNAUTHORIZED: '请先登录',
  FORBIDDEN: '无权执行该操作',
  UPLOAD_TOO_LARGE: '图片不能超过 5MB',
  UPLOAD_TYPE_INVALID: '仅支持 JPG/PNG/WebP',
  NOT_FOUND: '内容不存在或已下架',
  INTERNAL_ERROR: '服务暂时不可用，请稍后重试',
};

export type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; code: ErrorCode; message: string; fieldErrors?: Record<string, string> };

export function ok<T>(data?: T): ActionResult<T> {
  return { ok: true, data };
}

export function fail(
  code: ErrorCode,
  options?: { message?: string; fieldErrors?: Record<string, string> },
): ActionResult<never> {
  return {
    ok: false,
    code,
    message: options?.message ?? ERROR_MESSAGES[code],
    fieldErrors: options?.fieldErrors,
  };
}

import type { ZodError } from 'zod';

/** 将 ZodError 映射为「字段 → 首条错误信息」，用于表单字段级展示。 */
export function firstFieldErrors(error: ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0];
    if (typeof key === 'string' && !(key in result)) {
      result[key] = issue.message;
    }
  }
  return result;
}

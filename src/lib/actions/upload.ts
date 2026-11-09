'use server';

import { getCurrentUser } from '@/lib/auth/current-user';
import { saveImage } from '@/lib/storage/images';

export async function uploadImageAction(formData: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  try {
    const user = await getCurrentUser();
    if (!user) return { ok: false, error: '请先登录' };
    if (user.role !== 'ADMIN') return { ok: false, error: '仅管理员可上传' };

    const file = formData.get('file') as File | null;
    if (!file) return { ok: false, error: '请选择图片文件' };

    // 类型校验
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { ok: false, error: '仅支持 JPG/PNG/WebP' };
    }
    // 大小校验（5MB）
    if (file.size > 5 * 1024 * 1024) {
      return { ok: false, error: '图片不能超过 5MB' };
    }

    // 生成唯一文件名
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const filename = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;
    const buffer = Buffer.from(await file.arrayBuffer());
    const url = await saveImage(filename, buffer);

    return { ok: true, url };
  } catch (error) {
    console.error('uploadImageAction error:', error);
    return { ok: false, error: error instanceof Error ? error.message : '上传失败' };
  }
}
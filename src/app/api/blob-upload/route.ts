import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { requireAdmin } from '@/lib/auth/guards';

export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return Response.json({ error: { code: 'UNAUTHORIZED', message: '请先登录' } }, { status: 401 });
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const ext = pathname.split('.').pop()?.toLowerCase() ?? '';
        const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
        if (!allowedTypes.includes(`image/${ext === 'jpg' ? 'jpeg' : ext}`)) {
          throw new Error('UPLOAD_TYPE_INVALID');
        }
        return {
          allowedContentTypes: allowedTypes,
          maximumSizeInBytes: 5 * 1024 * 1024,
          tokenPayload: JSON.stringify({ kind: pathname.split('/')[1] ?? 'general' }),
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // 上传成功回调，可在此记录日志（不保存到数据库）
        console.log('blob uploaded:', blob.url, tokenPayload);
      },
    });

    return Response.json(jsonResponse);
  } catch (error) {
    const message = error instanceof Error ? error.message : '上传失败';
    const code = message === 'UPLOAD_TYPE_INVALID' ? 'UPLOAD_TYPE_INVALID' : 'INTERNAL_ERROR';
    const status = code === 'UPLOAD_TYPE_INVALID' ? 415 : 500;
    return Response.json({ error: { code, message } }, { status });
  }
}

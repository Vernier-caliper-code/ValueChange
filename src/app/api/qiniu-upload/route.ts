import { NextResponse } from 'next/server';
import qiniu from 'qiniu';

import { requireAdmin } from '@/lib/auth/guards';

/**
 * 生成七牛云直传 token。
 * 前端拿这个 token 直接 POST 到七牛上传，图片不经过本站服务器。
 */
export async function POST(request: Request) {
  const gate = await requireAdmin();
  if (!gate.ok) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED', message: '请先登录' } }, { status: 401 });
  }

  const { filename } = await request.json().catch(() => ({}));
  const accessKey = process.env.QINIU_ACCESS_KEY;
  const secretKey = process.env.QINIU_SECRET_KEY;
  const bucket = process.env.QINIU_BUCKET;
  const domain = process.env.QINIU_DOMAIN; // 例如 cdn.example.com 或七牛测试域名

  if (!accessKey || !secretKey || !bucket || !domain) {
    return NextResponse.json(
      { error: { code: 'CONFIG_MISSING', message: '七牛云未配置，请联系站长' } },
      { status: 500 },
    );
  }

  // 文件类型与大小校验（在 PutPolicy 里限制）
  const ext = (filename?.split('.').pop() ?? 'jpg').toLowerCase();
  const allowed = ['jpg', 'jpeg', 'png', 'webp'];
  if (!allowed.includes(ext)) {
    return NextResponse.json({ error: { code: 'UPLOAD_TYPE_INVALID', message: '仅支持 JPG/PNG/WebP' } }, { status: 415 });
  }

  const key = `valuepass/${new Date().getFullYear()}/${crypto.randomUUID()}.${ext}`;
  const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
  const putPolicy = new qiniu.rs.PutPolicy({
    scope: bucket,
    expires: 3600, // token 1 小时有效
    fsizeLimit: 5 * 1024 * 1024, // 5MB
    mimeLimit: 'image/jpeg;image/png;image/webp',
  });
  const token = putPolicy.uploadToken(mac);

  return NextResponse.json({
    token,
    key,
    // 七牛上传地址（根据存储区域选，默认华东）
    uploadUrl: 'https://upload.qiniup.com',
    // 上传完成后图片的访问地址
    url: `https://${domain}/${key}`,
  });
}
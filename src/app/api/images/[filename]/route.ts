import { NextResponse } from 'next/server';

import { readImage } from '@/lib/storage/images';

const MIME_TYPES: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
};

/** 读取上传的图片（本地读 uploads/，Netlify 上读 Blobs）。 */
export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const { filename } = await params;
  // 防路径穿越
  if (filename.includes('/') || filename.includes('\\') || filename.includes('..')) {
    return new NextResponse('Not Found', { status: 404 });
  }

  const ext = filename.split('.').pop()?.toLowerCase() ?? '';
  const mime = MIME_TYPES[ext];
  if (!mime) return new NextResponse('Not Found', { status: 404 });

  const buffer = await readImage(filename);
  if (!buffer) return new NextResponse('Not Found', { status: 404 });

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      'Content-Type': mime,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
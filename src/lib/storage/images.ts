import { writeFileSync, mkdirSync, readFileSync, existsSync } from 'fs';
import path from 'path';

import { getStore } from '@netlify/blobs';

const STORE_NAME = 'valuepass-images';
const LOCAL_DIR = path.join(process.cwd(), 'uploads');

/** 是否运行在 Netlify 环境（Blobs 自动可用）。 */
function isNetlify(): boolean {
  return process.env.NETLIFY === 'true' || !!process.env.NETLIFY_BLOBS_CONTEXT;
}

/** 保存图片，返回可访问的相对路径。 */
export async function saveImage(filename: string, data: Buffer): Promise<string> {
  if (isNetlify()) {
    const store = getStore(STORE_NAME);
    const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength) as ArrayBuffer;
    await store.set(filename, arrayBuffer);
  } else {
    mkdirSync(LOCAL_DIR, { recursive: true });
    writeFileSync(path.join(LOCAL_DIR, filename), data);
  }
  return `/api/images/${filename}`;
}

/** 读取图片，返回二进制内容；不存在时返回 null。 */
export async function readImage(filename: string): Promise<Buffer | null> {
  if (isNetlify()) {
    const store = getStore(STORE_NAME);
    const result = await store.get(filename, { type: 'arrayBuffer' });
    return result ? Buffer.from(result) : null;
  }
  const filePath = path.join(LOCAL_DIR, filename);
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath);
}
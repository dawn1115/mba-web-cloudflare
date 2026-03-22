import 'server-only';

import { getCloudflareContext } from '@opennextjs/cloudflare';

function sanitizeFileName(fileName: string) {
  return fileName.replace(/[^a-zA-Z0-9._-]/g, '-').replace(/-+/g, '-');
}

async function getR2Bucket(): Promise<R2Bucket> {
  const { env } = getCloudflareContext();
  return env.FILES;
}

export async function saveUpload(file: File, scope = 'runtime') {
  if (!file || file.size === 0) {
    return null;
  }

  const dotIdx = file.name.lastIndexOf('.');
  const extension = dotIdx >= 0 ? file.name.slice(dotIdx) : '';
  const baseName = dotIdx >= 0 ? file.name.slice(0, dotIdx) : file.name;
  const safeName = sanitizeFileName(baseName || 'upload');
  const datePrefix = new Date().toISOString().slice(0, 7); // YYYY-MM
  // 使用 Web Crypto API 生成 UUID（Edge Runtime 兼容）
  const key = `${scope}/${datePrefix}/${crypto.randomUUID()}-${safeName}${extension}`;

  const bucket = await getR2Bucket();
  await bucket.put(key, await file.arrayBuffer(), {
    httpMetadata: { contentType: file.type || 'application/octet-stream' },
    customMetadata: { originalName: file.name },
  });

  return {
    fileName: file.name,
    filePath: key,
    mimeType: file.type || 'application/octet-stream',
    size: file.size,
  };
}

export async function readStoredFile(key: string): Promise<ArrayBuffer> {
  const bucket = await getR2Bucket();
  const object = await bucket.get(key);

  if (!object) {
    throw new Error(`文件不存在：${key}`);
  }

  return object.arrayBuffer();
}

export async function getStoredFileMeta(key: string) {
  const bucket = await getR2Bucket();
  const object = await bucket.head(key);

  if (!object) {
    throw new Error(`文件不存在：${key}`);
  }

  return {
    size: object.size,
    contentType: object.httpMetadata?.contentType,
    uploaded: object.uploaded,
  };
}

export async function deleteStoredFile(key: string) {
  const bucket = await getR2Bucket();
  await bucket.delete(key);
}

/**
 * Edge Runtime 兼容的密码哈希工具
 * 使用 PBKDF2 + Web Crypto API 替代 bcryptjs
 *
 * 格式: pbkdf2$<iterations>$<hex-salt>$<hex-hash>
 */

const ITERATIONS = 100_000;
const KEY_LENGTH = 32; // bytes

function hexEncode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function hexDecode(hex: string): ArrayBuffer {
  const arr = new Uint8Array(hex.length / 2);
  for (let i = 0; i < arr.length; i++) {
    arr[i] = parseInt(hex.slice(i * 2, i * 2 + 2), 16);
  }
  return arr.buffer as ArrayBuffer;
}

async function importPasswordKey(password: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveBits'],
  );
}

export async function hashPassword(password: string): Promise<string> {
  const saltBytes = crypto.getRandomValues(new Uint8Array(16));
  const saltBuf = saltBytes.buffer as ArrayBuffer;

  const keyMaterial = await importPasswordKey(password);
  const hashBuf = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuf, iterations: ITERATIONS },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  return `pbkdf2$${ITERATIONS}$${hexEncode(saltBytes)}$${hexEncode(hashBuf)}`;
}

export async function comparePassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  // 向下兼容旧的 bcrypt 哈希（$2b$ 开头）
  // 正式上线前需要通过"忘记密码"流程将旧用户密码重置为 PBKDF2 格式
  if (!storedHash.startsWith('pbkdf2$')) {
    return false;
  }

  const parts = storedHash.split('$');
  if (parts.length !== 4) return false;

  const [, iterStr, saltHex, hashHex] = parts;
  const iterations = parseInt(iterStr, 10);
  const saltBuf = hexDecode(saltHex);

  const keyMaterial = await importPasswordKey(password);
  const hashBuf = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt: saltBuf, iterations },
    keyMaterial,
    KEY_LENGTH * 8,
  );

  const computed = hexEncode(hashBuf);
  // 常量时间比较（防时序攻击）
  if (computed.length !== hashHex.length) return false;
  let diff = 0;
  for (let i = 0; i < computed.length; i++) {
    diff |= computed.charCodeAt(i) ^ hashHex.charCodeAt(i);
  }
  return diff === 0;
}

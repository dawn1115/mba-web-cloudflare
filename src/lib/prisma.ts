import 'server-only';

import { PrismaClient } from '@prisma/client';
import { PrismaD1 } from '@prisma/adapter-d1';
import { getCloudflareContext } from '@opennextjs/cloudflare';

function createPrismaClient(): PrismaClient {
  try {
    // Cloudflare Workers / Pages 环境：使用 D1 适配器
    const { env } = getCloudflareContext();
    const adapter = new PrismaD1(env.DB);
    return new PrismaClient({ adapter });
  } catch {
    // 本地开发降级到标准 SQLite 连接
    return new PrismaClient({
      log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

import 'server-only';

import { prisma } from '@/lib/prisma';

type ActivityInput = {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  detail?: string | null;
};

export async function logActivity(input: ActivityInput) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: input.userId ?? null,
        action: input.action,
        entityType: input.entityType,
        entityId: input.entityId ?? null,
        detail: input.detail ?? null,
      },
    });
  } catch (error) {
    console.error('Failed to write activity log', error);
  }
}

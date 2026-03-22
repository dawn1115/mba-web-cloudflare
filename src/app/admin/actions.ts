'use server';

import { revalidatePath } from 'next/cache';

import { requireAdmin } from '@/lib/auth';
import { logActivity } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export async function approveUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get('userId') ?? '');
  const role = String(formData.get('role') ?? 'normal');

  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'active',
      role,
    },
  });

  await logActivity({
    userId: admin.id,
    action: 'user.approve',
    entityType: 'user',
    entityId: userId,
    detail: `审核并激活用户，角色设为 ${role}`,
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function disableUserAction(formData: FormData) {
  const admin = await requireAdmin();
  const userId = String(formData.get('userId') ?? '');

  if (!userId) {
    return;
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      status: 'disabled',
    },
  });

  await logActivity({
    userId: admin.id,
    action: 'user.disable',
    entityType: 'user',
    entityId: userId,
    detail: '停用用户账号',
  });

  revalidatePath('/admin');
}

export async function reviewCaseAction(formData: FormData) {
  const admin = await requireAdmin();
  const caseId = String(formData.get('caseId') ?? '');
  const status = String(formData.get('status') ?? '');
  const reviewComment = String(formData.get('reviewComment') ?? '').trim();

  if (!caseId || !['approved', 'rejected', 'archived'].includes(status)) {
    return;
  }

  const updateData =
    status === 'approved'
      ? {
          status,
          reviewComment: reviewComment || '审核通过，已发布到案例共享平台。',
          reviewerId: admin.id,
          reviewedAt: new Date(),
          publishedAt: new Date(),
          archivedAt: null,
        }
      : status === 'archived'
        ? {
            status,
            reviewComment: reviewComment || '案例已归档，仅保留浏览权限。',
            reviewerId: admin.id,
            reviewedAt: new Date(),
            archivedAt: new Date(),
          }
        : {
            status,
            reviewComment: reviewComment || '案例需要补充信息后重新提交审核。',
            reviewerId: admin.id,
            reviewedAt: new Date(),
          };

  await prisma.case.update({
    where: { id: caseId },
    data: updateData,
  });

  await logActivity({
    userId: admin.id,
    action: `case.${status}`,
    entityType: 'case',
    entityId: caseId,
    detail: reviewComment || `案例状态更新为 ${status}`,
  });

  revalidatePath('/admin');
  revalidatePath('/cases');
  revalidatePath(`/cases/${caseId}`);
  revalidatePath('/');
}

export async function createNoticeAction(formData: FormData) {
  const admin = await requireAdmin();
  const title = String(formData.get('title') ?? '').trim();
  const content = String(formData.get('content') ?? '').trim();
  const isPinned = formData.get('isPinned') === 'on';

  if (!title || !content) {
    return;
  }

  const notice = await prisma.notice.create({
    data: {
      title,
      content,
      isPinned,
      authorId: admin.id,
      publishedAt: new Date(),
    },
  });

  await logActivity({
    userId: admin.id,
    action: 'notice.create',
    entityType: 'notice',
    entityId: notice.id,
    detail: `发布公告：${title}`,
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

export async function deleteNoticeAction(formData: FormData) {
  const admin = await requireAdmin();
  const noticeId = String(formData.get('noticeId') ?? '');

  if (!noticeId) {
    return;
  }

  const notice = await prisma.notice.findUnique({
    where: { id: noticeId },
  });

  if (!notice) {
    return;
  }

  await prisma.notice.delete({
    where: { id: noticeId },
  });

  await logActivity({
    userId: admin.id,
    action: 'notice.delete',
    entityType: 'notice',
    entityId: noticeId,
    detail: `删除公告：${notice.title}`,
  });

  revalidatePath('/admin');
  revalidatePath('/');
}

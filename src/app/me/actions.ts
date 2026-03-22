'use server';

import { revalidatePath } from 'next/cache';

import { requireUser } from '@/lib/auth';
import { hashPassword, comparePassword } from '@/lib/password';
import { logActivity } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;

export async function updateProfileAction(formData: FormData) {
  const user = await requireUser();

  const payload = {
    name: String(formData.get('name') ?? '').trim(),
    phone: String(formData.get('phone') ?? '').trim() || null,
    identifier: String(formData.get('identifier') ?? '').trim() || null,
    major: String(formData.get('major') ?? '').trim() || null,
    department: String(formData.get('department') ?? '').trim() || null,
    bio: String(formData.get('bio') ?? '').trim() || null,
  };

  if (!payload.name) {
    return;
  }

  if (payload.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: payload.phone,
        id: { not: user.id },
      },
      select: { id: true },
    });

    if (existingPhone) {
      return;
    }
  }

  await prisma.user.update({
    where: { id: user.id },
    data: payload,
  });

  await logActivity({
    userId: user.id,
    action: 'profile.update',
    entityType: 'user',
    entityId: user.id,
    detail: '更新个人资料',
  });

  revalidatePath('/me');
}

export async function updatePasswordAction(formData: FormData) {
  const user = await requireUser();
  const currentPassword = String(formData.get('currentPassword') ?? '');
  const nextPassword = String(formData.get('nextPassword') ?? '');
  const confirmPassword = String(formData.get('confirmPassword') ?? '');

  if (!currentPassword || !nextPassword || nextPassword !== confirmPassword) {
    return;
  }

  if (!passwordRegex.test(nextPassword)) {
    return;
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { password: true },
  });

  if (!currentUser) {
    return;
  }

  const isValid = await comparePassword(currentPassword, currentUser.password);
  if (!isValid) {
    return;
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password: await hashPassword(nextPassword),
    },
  });

  await logActivity({
    userId: user.id,
    action: 'profile.password',
    entityType: 'user',
    entityId: user.id,
    detail: '修改登录密码',
  });

  revalidatePath('/me');
}

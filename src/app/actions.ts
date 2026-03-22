'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { deleteAuthCookie, requireUser, getAuthCookieOptions, signAuthToken } from '@/lib/auth';
import { hashPassword, comparePassword } from '@/lib/password';
import { logActivity } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';

const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{6,}$/;

export async function loginAction(prevState: unknown, formData: FormData) {
  try {
    const loginId = formData.get('loginId') as string;
    const password = formData.get('password') as string;

    if (!loginId || !password) {
      return { error: '请输入登录账号和密码。' };
    }

    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: loginId },
          { phone: loginId },
          { identifier: loginId },
        ],
      },
    });

    if (!user) {
      return { error: '账号或密码错误。' };
    }

    const passwordValid = await comparePassword(password, user.password);
    if (!passwordValid) {
      return { error: '账号或密码错误。' };
    }

    if (user.status === 'pending') {
      return { error: '账号仍在审核中，请等待管理员激活。' };
    }

    if (user.status === 'disabled') {
      return { error: '账号已被停用，请联系管理员。' };
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
      },
    });

    await logActivity({
      userId: user.id,
      action: 'auth.login',
      entityType: 'user',
      entityId: user.id,
      detail: '用户登录平台',
    });

    const cookieStore = await cookies();
    cookieStore.set(
      'auth_token',
      await signAuthToken({ userId: user.id, email: user.email, role: user.role }),
      getAuthCookieOptions(),
    );

  } catch (error) {
    console.error('Failed to login', error);
    return { error: '服务器异常，请稍后重试。' };
  }

  redirect('/');
}

export async function registerAction(prevState: unknown, formData: FormData) {
  try {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const phone = formData.get('phone') as string;
    const password = formData.get('password') as string;
    const confirmPassword = formData.get('confirmPassword') as string;

    if (!name || !email || !password) {
      return { error: '请填写姓名、邮箱和密码。' };
    }

    if (password !== confirmPassword) {
      return { error: '两次输入的密码不一致。' };
    }

    if (!passwordRegex.test(password)) {
      return { error: '密码至少 6 位，且需同时包含字母和数字。' };
    }

    const emailExists = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (emailExists) {
      return { error: '该邮箱已被注册。' };
    }

    if (phone) {
      const phoneExists = await prisma.user.findFirst({
        where: { phone },
        select: { id: true },
      });

      if (phoneExists) {
        return { error: '该手机号已被使用。' };
      }
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        phone: phone || null,
        role: 'student',
        status: 'pending',
        password: await hashPassword(password),
      },
    });

    await logActivity({
      userId: user.id,
      action: 'user.register',
      entityType: 'user',
      entityId: user.id,
      detail: '提交注册申请，等待审核激活',
    });

  } catch (error) {
    console.error('Failed to register user', error);
    return { error: '服务器异常，请稍后重试。' };
  }

  redirect('/login?registered=1');
}

export async function logoutAction() {
  await deleteAuthCookie();
  redirect('/');
}

export async function toggleCollectionAction(caseId: string) {
  const user = await requireUser();

  const existing = await prisma.collection.findUnique({
    where: {
      userId_caseId: {
        userId: user.id,
        caseId,
      },
    },
  });

  if (existing) {
    await prisma.collection.delete({
      where: {
        userId_caseId: {
          userId: user.id,
          caseId,
        },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'case.unfavorite',
      entityType: 'case',
      entityId: caseId,
      detail: '取消收藏案例',
    });
  } else {
    await prisma.collection.create({
      data: {
        userId: user.id,
        caseId,
      },
    });

    await logActivity({
      userId: user.id,
      action: 'case.favorite',
      entityType: 'case',
      entityId: caseId,
      detail: '收藏案例',
    });
  }

  revalidatePath('/cases');
  revalidatePath(`/cases/${caseId}`);
  revalidatePath('/me');
}

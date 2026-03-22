import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCloudflareContext } from '@opennextjs/cloudflare';

import { prisma } from '@/lib/prisma';
import { normalizeRole, normalizeUserStatus } from '@/lib/permissions';
import { signJWT, verifyJWT } from '@/lib/jwt';

const COOKIE_NAME = 'auth_token';

function getJwtSecret() {
  try {
    const { env } = getCloudflareContext();
    if (env.JWT_SECRET) {
      return env.JWT_SECRET;
    }
  } catch {}

  return process.env.JWT_SECRET || 'mba-web-development-secret';
}

const JWT_SECRET = getJwtSecret();

export type SessionPayload = {
  userId: string;
  email: string;
  role: string;
};

export async function signAuthToken(payload: SessionPayload): Promise<string> {
  return signJWT(payload as unknown as Record<string, unknown>, JWT_SECRET, 7 * 24 * 3600);
}

export async function verifyAuthToken(token: string): Promise<SessionPayload | null> {
  return verifyJWT<SessionPayload>(token, JWT_SECRET);
}

export function getAuthCookieOptions() {
  return {
    httpOnly: true,
    path: '/',
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 7,
  };
}

export async function getSession(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function getCurrentUser() {
  const session = await getSession();

  if (!session) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      identifier: true,
      role: true,
      status: true,
      major: true,
      department: true,
      bio: true,
      createdAt: true,
      updatedAt: true,
      lastLoginAt: true,
    },
  });

  if (!user) {
    return null;
  }

  return {
    ...user,
    role: normalizeRole(user.role),
    status: normalizeUserStatus(user.status),
  };
}

export async function requireUser() {
  const user = await getCurrentUser();

  if (!user || user.status !== 'active') {
    redirect('/login');
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  if (user.role !== 'admin') {
    redirect('/');
  }

  return user;
}

export async function deleteAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const AUTH_COOKIE_NAME = COOKIE_NAME;

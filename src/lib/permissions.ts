import type { Case, User } from '@prisma/client';

import type { AccessLevel, CaseStatus, Role, UserStatus } from '@/lib/catalog';

type AuthUser = Pick<User, 'id' | 'role' | 'status'> | null;
type CasePreview = Pick<Case, 'accessLevel' | 'status' | 'uploaderId'>;

export function normalizeRole(role: string): Role {
  return (['admin', 'pro', 'teacher', 'student', 'normal'].includes(role)
    ? role
    : 'normal') as Role;
}

export function normalizeUserStatus(status: string): UserStatus {
  return (['pending', 'active', 'disabled'].includes(status)
    ? status
    : 'pending') as UserStatus;
}

export function normalizeCaseStatus(status: string): CaseStatus {
  return (['pending', 'approved', 'rejected', 'archived'].includes(status)
    ? status
    : 'pending') as CaseStatus;
}

export function normalizeAccessLevel(level: string): AccessLevel {
  return (['public', 'campus', 'restricted'].includes(level)
    ? level
    : 'public') as AccessLevel;
}

export function isAdmin(user: AuthUser) {
  return user?.role === 'admin' && user.status === 'active';
}

export function canUploadCases(user: AuthUser) {
  if (!user || user.status !== 'active') {
    return false;
  }

  return user.role === 'admin' || user.role === 'pro';
}

export function canReviewCases(user: AuthUser) {
  return isAdmin(user);
}

export function canManageUsers(user: AuthUser) {
  return isAdmin(user);
}

export function canFavoriteCases(user: AuthUser) {
  return !!user && user.status === 'active';
}

export function canDownloadCases(user: AuthUser) {
  if (!user || user.status !== 'active') {
    return false;
  }

  return user.role === 'admin' || user.role === 'pro';
}

export function canViewCase(user: AuthUser, item: CasePreview) {
  const status = normalizeCaseStatus(item.status);
  const accessLevel = normalizeAccessLevel(item.accessLevel);

  if (status === 'pending' || status === 'rejected') {
    return isAdmin(user) || user?.id === item.uploaderId;
  }

  if (status === 'approved') {
    if (accessLevel === 'public') {
      return true;
    }

    if (!user || user.status !== 'active') {
      return false;
    }

    if (accessLevel === 'campus') {
      return user.role !== 'normal';
    }

    return user.role === 'admin' || user.role === 'pro';
  }

  if (status === 'archived') {
    return true;
  }

  return false;
}

export function canDownloadCase(user: AuthUser, item: CasePreview) {
  if (normalizeCaseStatus(item.status) !== 'approved') {
    return false;
  }

  if (!canDownloadCases(user)) {
    return false;
  }

  const accessLevel = normalizeAccessLevel(item.accessLevel);

  if (accessLevel === 'public') {
    return true;
  }

  if (!user) {
    return false;
  }

  if (accessLevel === 'campus') {
    return user.role !== 'normal';
  }

  return user.role === 'admin' || user.role === 'pro';
}

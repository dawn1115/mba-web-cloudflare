import {
  ACCESS_LEVEL_LABELS,
  CASE_STATUS_LABELS,
  ROLE_LABELS,
  SORT_LABELS,
  USER_STATUS_LABELS,
  type AccessLevel,
  type CaseStatus,
  type Role,
  type SortOption,
  type UserStatus,
} from '@/lib/catalog';

export function formatDate(
  value: Date | string | null | undefined,
  options: Intl.DateTimeFormatOptions = {},
) {
  if (!value) {
    return '暂无';
  }

  const date = typeof value === 'string' ? new Date(value) : value;

  return new Intl.DateTimeFormat('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    ...options,
  }).format(date);
}

export function formatDateTime(value: Date | string | null | undefined) {
  return formatDate(value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat('zh-CN', {
    notation: value >= 10000 ? 'compact' : 'standard',
    maximumFractionDigits: 1,
  }).format(value);
}

export function roleLabel(role: Role) {
  return ROLE_LABELS[role];
}

export function userStatusLabel(status: UserStatus) {
  return USER_STATUS_LABELS[status];
}

export function caseStatusLabel(status: CaseStatus) {
  return CASE_STATUS_LABELS[status];
}

export function accessLevelLabel(level: AccessLevel) {
  return ACCESS_LEVEL_LABELS[level];
}

export function sortLabel(sort: SortOption) {
  return SORT_LABELS[sort];
}

export function splitKeywords(keywords: string | null | undefined) {
  return (keywords ?? '')
    .split(/[，,]/)
    .map((item) => item.trim())
    .filter(Boolean);
}

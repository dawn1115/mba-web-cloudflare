export const ROLE_OPTIONS = ['admin', 'pro', 'teacher', 'student', 'normal'] as const;
export const USER_STATUS_OPTIONS = ['pending', 'active', 'disabled'] as const;
export const CASE_STATUS_OPTIONS = ['pending', 'approved', 'rejected', 'archived'] as const;
export const ACCESS_LEVEL_OPTIONS = ['public', 'campus', 'restricted'] as const;

export type Role = (typeof ROLE_OPTIONS)[number];
export type UserStatus = (typeof USER_STATUS_OPTIONS)[number];
export type CaseStatus = (typeof CASE_STATUS_OPTIONS)[number];
export type AccessLevel = (typeof ACCESS_LEVEL_OPTIONS)[number];

export const ROLE_LABELS: Record<Role, string> = {
  admin: '管理员',
  pro: 'Pro 用户',
  teacher: '教师',
  student: '学生',
  normal: '外部用户',
};

export const USER_STATUS_LABELS: Record<UserStatus, string> = {
  pending: '待审核',
  active: '已激活',
  disabled: '已停用',
};

export const CASE_STATUS_LABELS: Record<CaseStatus, string> = {
  pending: '待审核',
  approved: '已发布',
  rejected: '已退回',
  archived: '已归档',
};

export const ACCESS_LEVEL_LABELS: Record<AccessLevel, string> = {
  public: '公开共享',
  campus: '仅校内使用',
  restricted: '仅限授权群体',
};

export const CATEGORY_OPTIONS = [
  '战略管理',
  '市场营销',
  '人力资源',
  '财务管理',
  '运营管理',
  '创新创业',
  '商业伦理',
  '数字化转型',
  '建筑、建材业与房地产业',
] as const;

export const CASE_TYPE_OPTIONS = [
  '描述型案例',
  '分析型案例',
  '决策型案例',
  '综合型案例',
] as const;

export const COURSE_OPTIONS = [
  '战略管理',
  '市场营销',
  '组织行为学',
  '人力资源管理',
  '公司金融',
  '运营管理',
  '创新创业管理',
] as const;

export const SORT_OPTIONS = ['latest', 'downloads', 'views'] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

export const SORT_LABELS: Record<SortOption, string> = {
  latest: '最新发布',
  downloads: '下载量优先',
  views: '浏览量优先',
};

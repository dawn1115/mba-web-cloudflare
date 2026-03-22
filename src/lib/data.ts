import 'server-only';

import type { Prisma } from '@prisma/client';

import type { Role, SortOption, UserStatus } from '@/lib/catalog';
import { normalizeCaseStatus } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

type Viewer = {
  id: string;
  role: Role;
  status: UserStatus;
} | null;

type CaseListFilters = {
  q?: string;
  category?: string;
  type?: string;
  course?: string;
  access?: string;
  status?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

function buildCaseOrder(sort: SortOption): Prisma.CaseOrderByWithRelationInput[] {
  if (sort === 'downloads') {
    return [{ downloads: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  }

  if (sort === 'views') {
    return [{ views: 'desc' }, { publishedAt: 'desc' }, { createdAt: 'desc' }];
  }

  return [{ publishedAt: 'desc' }, { createdAt: 'desc' }];
}

function buildCaseWhere(viewer: Viewer, filters: CaseListFilters): Prisma.CaseWhereInput {
  const where: Prisma.CaseWhereInput = {};
  const andFilters: Prisma.CaseWhereInput[] = [];
  const query = filters.q?.trim();

  const requestedStatus = filters.status?.trim();
  const isAdmin = viewer?.role === 'admin' && viewer.status === 'active';

  if (isAdmin && requestedStatus) {
    andFilters.push({ status: normalizeCaseStatus(requestedStatus) });
  } else {
    andFilters.push({ status: { in: ['approved', 'archived'] } });
  }

  if (query) {
    andFilters.push({
      OR: [
        { title: { contains: query } },
        { author: { contains: query } },
        { abstract: { contains: query } },
        { keywords: { contains: query } },
        { company: { contains: query } },
      ],
    });
  }

  if (filters.category) {
    andFilters.push({ category: filters.category });
  }

  if (filters.type) {
    andFilters.push({ type: filters.type });
  }

  if (filters.course) {
    andFilters.push({ course: filters.course });
  }

  if (filters.access) {
    andFilters.push({ accessLevel: filters.access });
  }

  where.AND = andFilters;
  return where;
}

export async function listCases(viewer: Viewer, filters: CaseListFilters) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(24, Math.max(1, filters.pageSize ?? 9));
  const sort = (['latest', 'downloads', 'views'].includes(filters.sort ?? '')
    ? filters.sort
    : 'latest') as SortOption;
  const where = buildCaseWhere(viewer, filters);

  const [total, items] = await prisma.$transaction([
    prisma.case.count({ where }),
    prisma.case.findMany({
      where,
      orderBy: buildCaseOrder(sort),
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: {
        uploader: {
          select: {
            id: true,
            name: true,
            role: true,
          },
        },
        _count: {
          select: {
            collections: true,
            attachments: true,
          },
        },
      },
    }),
  ]);

  return {
    items,
    total,
    page,
    pageSize,
    sort,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

export async function getCaseDetail(id: string) {
  return prisma.case.findUnique({
    where: { id },
    include: {
      uploader: {
        select: {
          id: true,
          name: true,
          role: true,
        },
      },
      reviewer: {
        select: {
          id: true,
          name: true,
        },
      },
      attachments: {
        orderBy: { createdAt: 'asc' },
      },
      _count: {
        select: {
          collections: true,
          downloadRecords: true,
        },
      },
    },
  });
}

export async function getFeaturedCases(limit = 3) {
  return prisma.case.findMany({
    where: {
      status: 'approved',
    },
    orderBy: [{ downloads: 'desc' }, { views: 'desc' }, { publishedAt: 'desc' }],
    take: limit,
  });
}

export async function getHomePageData() {
  const [stats, featuredCases, latestCases, notices, categoryItems] = await prisma.$transaction([
    prisma.case.aggregate({
      where: { status: 'approved' },
      _count: { _all: true },
      _sum: {
        downloads: true,
        views: true,
      },
    }),
    prisma.case.findMany({
      where: { status: 'approved' },
      orderBy: [{ downloads: 'desc' }, { publishedAt: 'desc' }],
      take: 3,
    }),
    prisma.case.findMany({
      where: { status: 'approved' },
      orderBy: [{ publishedAt: 'desc' }, { createdAt: 'desc' }],
      take: 4,
    }),
    prisma.notice.findMany({
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      include: {
        author: {
          select: {
            name: true,
          },
        },
      },
      take: 4,
    }),
    prisma.case.findMany({
      where: { status: 'approved' },
      select: { category: true },
    }),
  ]);

  const [userCount, activeUserCount] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({
      where: {
        status: 'active',
      },
    }),
  ]);

  return {
    stats: {
      caseCount: stats._count._all,
      downloadCount: stats._sum.downloads ?? 0,
      viewCount: stats._sum.views ?? 0,
      userCount,
      activeUserCount,
    },
    featuredCases,
    latestCases,
    notices,
    categoryGroups: Object.entries(
      categoryItems.reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.category] = (accumulator[item.category] ?? 0) + 1;
        return accumulator;
      }, {}),
    )
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
  };
}

export async function getAdminDashboardData() {
  const [
    totalUsers,
    pendingUsers,
    totalCases,
    pendingCases,
    noticeCount,
    latestLogs,
    recentUsers,
    reviewQueue,
    recentNotices,
    categoryItems,
  ] = await prisma.$transaction([
    prisma.user.count(),
    prisma.user.count({ where: { status: 'pending' } }),
    prisma.case.count(),
    prisma.case.count({ where: { status: 'pending' } }),
    prisma.notice.count(),
    prisma.activityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: {
        user: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    }),
    prisma.user.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 8,
    }),
    prisma.case.findMany({
      where: { status: 'pending' },
      orderBy: { createdAt: 'asc' },
      take: 8,
      include: {
        uploader: {
          select: {
            name: true,
            role: true,
          },
        },
      },
    }),
    prisma.notice.findMany({
      orderBy: [{ isPinned: 'desc' }, { publishedAt: 'desc' }],
      take: 5,
      include: {
        author: {
          select: { name: true },
        },
      },
    }),
    prisma.case.findMany({
      where: { status: 'approved' },
      select: { category: true },
    }),
  ]);

  return {
    metrics: {
      totalUsers,
      pendingUsers,
      totalCases,
      pendingCases,
      noticeCount,
    },
    latestLogs,
    recentUsers,
    reviewQueue,
    recentNotices,
    categoryGroups: Object.entries(
      categoryItems.reduce<Record<string, number>>((accumulator, item) => {
        accumulator[item.category] = (accumulator[item.category] ?? 0) + 1;
        return accumulator;
      }, {}),
    )
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
  };
}

export async function getUserCenterData(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      collections: {
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          caseRef: true,
        },
      },
      downloadRecords: {
        orderBy: { createdAt: 'desc' },
        take: 8,
        include: {
          caseRef: true,
        },
      },
      uploadedCases: {
        orderBy: { createdAt: 'desc' },
        take: 8,
      },
    },
  });
}

export async function createCaseSerialNumber() {
  const year = new Date().getFullYear();
  const start = new Date(year, 0, 1);
  const end = new Date(year + 1, 0, 1);
  const count = await prisma.case.count({
    where: {
      createdAt: {
        gte: start,
        lt: end,
      },
    },
  });

  return `AHNU-MBA-${year}-${String(count + 1).padStart(4, '0')}`;
}

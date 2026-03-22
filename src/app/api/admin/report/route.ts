import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

function toCsvRow(values: Array<string | number>) {
  return values
    .map((value) => `"${String(value).replaceAll('"', '""')}"`)
    .join(',');
}

export async function GET() {
  const viewer = await getCurrentUser();

  if (!viewer || viewer.role !== 'admin' || viewer.status !== 'active') {
    return NextResponse.json({ message: '没有权限导出报表。' }, { status: 403 });
  }

  const [users, cases] = await prisma.$transaction([
    prisma.user.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        name: true,
        email: true,
        role: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.case.findMany({
      orderBy: { createdAt: 'asc' },
      select: {
        serialNumber: true,
        title: true,
        category: true,
        type: true,
        course: true,
        status: true,
        downloads: true,
        views: true,
        createdAt: true,
      },
    }),
  ]);

  const userRows = [
    ['用户报表'],
    ['姓名', '邮箱', '角色', '状态', '创建时间'],
    ...users.map((user) => [
      user.name,
      user.email,
      user.role,
      user.status,
      user.createdAt.toISOString(),
    ]),
    [''],
  ];

  const caseRows = [
    ['案例报表'],
    ['编号', '标题', '分类', '类型', '课程', '状态', '下载量', '浏览量', '创建时间'],
    ...cases.map((item) => [
      item.serialNumber,
      item.title,
      item.category,
      item.type,
      item.course,
      item.status,
      item.downloads,
      item.views,
      item.createdAt.toISOString(),
    ]),
  ];

  const csv = '\uFEFF' + [...userRows, ...caseRows].map(toCsvRow).join('\n');

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': "attachment; filename*=UTF-8''mba-platform-report.csv",
    },
  });
}

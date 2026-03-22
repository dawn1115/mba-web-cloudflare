import { NextResponse } from 'next/server';

import { getCurrentUser } from '@/lib/auth';
import { getCaseDetail } from '@/lib/data';
import { logActivity } from '@/lib/logger';
import { canDownloadCase } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';
import { readStoredFile } from '@/lib/storage';

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const viewer = await getCurrentUser();
  const item = await getCaseDetail(id);

  if (!item) {
    return NextResponse.json({ message: '案例不存在。' }, { status: 404 });
  }

  if (!canDownloadCase(viewer, item)) {
    return NextResponse.json({ message: '当前账号没有下载权限。' }, { status: 403 });
  }

  const attachmentId = new URL(request.url).searchParams.get('attachment');
  const selectedAttachment = attachmentId
    ? item.attachments.find((attachment) => attachment.id === attachmentId)
    : null;

  const fileName = selectedAttachment?.fileName ?? item.primaryFileName;
  const filePath = selectedAttachment?.filePath ?? item.primaryFilePath;
  const mimeType = selectedAttachment?.mimeType ?? item.primaryFileMime ?? 'application/octet-stream';

  if (!filePath || !fileName) {
    return NextResponse.json({ message: '文件不存在。' }, { status: 404 });
  }

  const fileBuffer = await readStoredFile(filePath);

  await prisma.case.update({
    where: { id: item.id },
    data: {
      downloads: {
        increment: 1,
      },
    },
  });

  if (viewer) {
    await prisma.downloadRecord.create({
      data: {
        userId: viewer.id,
        caseId: item.id,
      },
    });
  }

  await logActivity({
    userId: viewer?.id,
    action: 'case.download',
    entityType: 'case',
    entityId: item.id,
    detail: `下载文件：${fileName}`,
  });

  return new NextResponse(fileBuffer, {
    headers: {
      'Content-Type': mimeType,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
    },
  });
}

'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requireUser } from '@/lib/auth';
import { canUploadCases } from '@/lib/permissions';
import { createCaseSerialNumber } from '@/lib/data';
import { logActivity } from '@/lib/logger';
import { prisma } from '@/lib/prisma';
import { saveUpload } from '@/lib/storage';

const allowedDocumentExtensions = new Set(['.pdf', '.doc', '.docx', '.txt']);

function getExtension(fileName: string): string {
  const dotIdx = fileName.lastIndexOf('.');
  return dotIdx >= 0 ? fileName.slice(dotIdx).toLowerCase() : '';
}

function isAllowedDocument(file: File) {
  return allowedDocumentExtensions.has(getExtension(file.name)) && file.size <= 50 * 1024 * 1024;
}

export async function submitCaseAction(formData: FormData) {
  const user = await requireUser();

  if (!canUploadCases(user)) {
    redirect('/cases/upload?forbidden=1');
  }

  const title = String(formData.get('title') ?? '').trim();
  const author = String(formData.get('author') ?? user.name).trim() || user.name;
  const category = String(formData.get('category') ?? '').trim();
  const type = String(formData.get('type') ?? '').trim();
  const course = String(formData.get('course') ?? '').trim();
  const company = String(formData.get('company') ?? '').trim() || null;
  const keywords = String(formData.get('keywords') ?? '').trim();
  const abstract = String(formData.get('abstract') ?? '').trim();
  const accessLevel = String(formData.get('accessLevel') ?? 'public').trim();
  const copyrightStatement = String(formData.get('copyrightStatement') ?? '').trim();
  const developmentYearRaw = String(formData.get('developmentYear') ?? '').trim();
  const developmentYear = developmentYearRaw ? Number(developmentYearRaw) : null;
  const primaryFile = formData.get('primaryFile');
  const attachmentFiles = formData
    .getAll('attachments')
    .filter((item): item is File => item instanceof File && item.size > 0);

  if (
    !title ||
    !category ||
    !type ||
    !course ||
    !keywords ||
    !abstract ||
    !copyrightStatement ||
    !(primaryFile instanceof File) ||
    !isAllowedDocument(primaryFile)
  ) {
    redirect('/cases/upload?invalid=1');
  }

  const storedPrimary = await saveUpload(primaryFile, 'runtime');

  if (!storedPrimary) {
    redirect('/cases/upload?invalid=1');
  }

  const storedAttachments = [];
  for (const file of attachmentFiles) {
    if (file.size > 50 * 1024 * 1024) {
      continue;
    }

    const stored = await saveUpload(file, 'runtime');
    if (stored) {
      storedAttachments.push(stored);
    }
  }

  const serialNumber = await createCaseSerialNumber();

  const created = await prisma.case.create({
    data: {
      serialNumber,
      title,
      author,
      abstract,
      keywords,
      category,
      type,
      course,
      company,
      developmentYear,
      accessLevel,
      copyrightStatement,
      status: 'pending',
      uploaderId: user.id,
      primaryFileName: storedPrimary.fileName,
      primaryFilePath: storedPrimary.filePath,
      primaryFileMime: storedPrimary.mimeType,
      primaryFileSize: storedPrimary.size,
      attachments: {
        create: storedAttachments.map((item) => ({
          kind: 'attachment',
          fileName: item.fileName,
          filePath: item.filePath,
          mimeType: item.mimeType,
          size: item.size,
        })),
      },
    },
  });

  await logActivity({
    userId: user.id,
    action: 'case.upload',
    entityType: 'case',
    entityId: created.id,
    detail: `上传案例《${title}》并提交审核`,
  });

  revalidatePath('/admin');
  revalidatePath('/me');
  revalidatePath('/cases/upload');

  redirect(`/cases/upload?submitted=1&caseId=${created.id}`);
}

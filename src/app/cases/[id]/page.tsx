import Link from 'next/link';
import { notFound } from 'next/navigation';

import { toggleCollectionAction } from '@/app/actions';
import { getCurrentUser } from '@/lib/auth';
import { getCaseDetail } from '@/lib/data';
import { accessLevelLabel, caseStatusLabel, formatCompactNumber, formatDate, splitKeywords } from '@/lib/format';
import { canDownloadCase, canFavoriteCases, canViewCase } from '@/lib/permissions';
import { prisma } from '@/lib/prisma';

export default async function CaseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [viewer, item] = await Promise.all([getCurrentUser(), getCaseDetail(id)]);

  if (!item) {
    notFound();
  }

  if (!canViewCase(viewer, item)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
      <div className="rounded-4xl border border-black/10 bg-(--panel) p-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.22em] text-(--muted)">访问受限</p>
        <h1 className="mt-4 text-3xl text-foreground">当前案例不在你的可查看范围内</h1>
        <p className="mt-4 text-sm leading-7 text-(--muted)">
          该案例可能处于待审核状态，或被设置为校内/授权访问。你可以联系平台管理员申请权限。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/cases" className="rounded-full border border-black/10 px-5 py-3 text-sm text-foreground">
            返回案例大厅
          </Link>
          {!viewer ? (
            <Link href="/login" className="rounded-full bg-(--accent) px-5 py-3 text-sm text-white">
              登录后再试
            </Link>
          ) : null}
        </div>
      </div>
    </div>
    );
  }

  const isCollected = viewer
    ? await prisma.collection.findUnique({
        where: {
          userId_caseId: {
            userId: viewer.id,
            caseId: item.id,
          },
        },
        select: { id: true },
      })
    : null;

  const keywords = splitKeywords(item.keywords);
  const allowDownload = canDownloadCase(viewer, item);
  const canCollect = canFavoriteCases(viewer);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <Link href="/cases" className="text-sm text-(--accent) transition hover:text-[#a24628]">
        返回案例大厅
      </Link>

      <section className="mt-5 rounded-4xl border border-black/10 bg-(--panel) p-8 shadow-sm">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-(--accent)/10 px-3 py-1 text-xs text-(--accent)">
            {item.category}
          </span>
          <span className="rounded-full bg-(--accent-dark)/10 px-3 py-1 text-xs text-(--accent-dark)">
            {item.type}
          </span>
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-(--muted)">
            {accessLevelLabel(item.accessLevel as 'public' | 'campus' | 'restricted')}
          </span>
          <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-(--muted)">
            {caseStatusLabel(item.status as 'pending' | 'approved' | 'rejected' | 'archived')}
          </span>
        </div>

        <div className="mt-5 grid gap-8 lg:grid-cols-[1.25fr_0.75fr]">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-(--muted)">{item.serialNumber}</p>
            <h1 className="mt-4 text-4xl leading-tight text-foreground">{item.title}</h1>
            {item.translatedTitle ? (
              <h2 className="mt-2 text-xl font-medium text-(--muted)">{item.translatedTitle}</h2>
            ) : null}
            <p className="mt-5 text-base leading-8 text-(--muted)"><strong className="text-foreground">中文摘要：</strong>{item.abstract}</p>
            {item.englishAbstract ? (
              <p className="mt-5 text-base leading-8 text-(--muted)"><strong className="text-foreground">英文摘要：</strong>{item.englishAbstract}</p>
            ) : null}
            <div className="mt-6">
              <strong className="text-sm text-foreground">中文关键词：</strong>
              <div className="mt-2 flex flex-wrap gap-2">
                {keywords.map((keyword) => (
                  <span key={keyword} className="rounded-full border border-black/10 px-3 py-1 text-xs text-(--muted)">
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
            {item.englishKeywords ? (
              <div className="mt-4">
                <strong className="text-sm text-foreground">英文关键词：</strong>
                <div className="mt-2 flex flex-wrap gap-2">
                  {splitKeywords(item.englishKeywords).map((keyword) => (
                    <span key={keyword} className="rounded-full border border-black/10 px-3 py-1 text-xs text-(--muted)">
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <aside className="rounded-[1.75rem] border border-black/10 bg-white p-5">
            <div className="space-y-3 text-sm text-(--muted)">
              <p>作者：<span className="text-foreground">{item.author}</span></p>
              {item.authorDepartment ? <p>作者单位：<span className="text-foreground">{item.authorDepartment}</span></p> : null}
              {item.advisor ? <p>指导者：<span className="text-foreground">{item.advisor}</span></p> : null}
              {item.translator ? <p>译者：<span className="text-foreground">{item.translator}</span></p> : null}
              <p>适用课程：<span className="text-foreground">{item.course}</span></p>
              <p>企业背景：<span className="text-foreground">{item.company ?? '暂无'}</span></p>
              {item.companyScale ? <p>企业规模：<span className="text-foreground">{item.companyScale}</span></p> : null}
              {item.functionalArea ? <p>职能领域：<span className="text-foreground">{item.functionalArea}</span></p> : null}
              <p>案例语种：<span className="text-foreground">{item.language}</span></p>
              {item.pageCount ? <p>正文页数：<span className="text-foreground">{item.pageCount} 页</span></p> : null}
              {item.targetAudience ? <p>适用对象：<span className="text-foreground">{item.targetAudience}</span></p> : null}
              {item.writingMethod ? <p>编写方式：<span className="text-foreground">{item.writingMethod}</span></p> : null}
              {item.theoreticalKnowledge ? <p>理论知识：<span className="text-foreground">{item.theoreticalKnowledge}</span></p> : null}
              <p>开发年份：<span className="text-foreground">{item.developmentYear ?? '暂无'}</span></p>
              <p>入库时间：<span className="text-foreground">{formatDate(item.publishedAt ?? item.createdAt)}</span></p>
              <p>浏览量：<span className="text-foreground">{formatCompactNumber(item.views)}</span></p>
              <p>下载量：<span className="text-foreground">{formatCompactNumber(item.downloads)}</span></p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              {allowDownload && item.primaryFilePath ? (
                <Link
                  href={`/api/cases/${item.id}/download`}
                  className="rounded-full bg-(--accent) px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a24628]"
                >
                  下载正文
                </Link>
              ) : (
                <div className="rounded-full border border-dashed border-black/10 px-5 py-3 text-sm text-(--muted)">
                  {item.status === 'archived' ? '归档案例不可下载' : '当前权限不可下载'}
                </div>
              )}
              {canCollect ? (
                <form action={toggleCollectionAction.bind(null, item.id)}>
                  <button
                    type="submit"
                    className="rounded-full border border-black/10 px-5 py-3 text-sm text-foreground transition hover:bg-black/5"
                  >
                    {isCollected ? '取消收藏' : '收藏案例'}
                  </button>
                </form>
              ) : null}
            </div>
          </aside>
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-4xl border border-black/10 bg-(--panel) p-8 shadow-sm">
          <h2 className="text-2xl text-foreground">案例说明</h2>
          <div className="mt-4 space-y-5 text-sm leading-8 text-(--muted)">
            <p>{item.abstract}</p>
            <p>
              本案例适用于 <span className="text-foreground">{item.course}</span> 课程，可结合
              <span className="text-foreground"> {item.category} </span>
              相关理论开展课堂讨论、专题研讨和案例汇报。
            </p>
            {item.reviewComment ? (
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                <p className="font-medium text-foreground">审核备注</p>
                <p className="mt-2 text-sm leading-7 text-(--muted)">{item.reviewComment}</p>
                {item.reviewer ? (
                  <p className="mt-2 text-xs text-(--muted)">
                    审核人：{item.reviewer.name} · {formatDate(item.reviewedAt)}
                  </p>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>

        <div className="space-y-8">
          <section className="rounded-4xl border border-black/10 bg-(--panel) p-6 shadow-sm">
            <h2 className="text-2xl text-foreground">附件与资料</h2>
            <div className="mt-4 space-y-3 text-sm">
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                <p className="font-medium text-foreground">{item.primaryFileName ?? '未上传正文'}</p>
                <p className="mt-2 text-(--muted)">
                  主文档 · {item.primaryFileSize ? `${Math.ceil(item.primaryFileSize / 1024)} KB` : '暂无大小信息'}
                </p>
                {allowDownload && item.primaryFilePath ? (
                  <Link href={`/api/cases/${item.id}/download`} className="mt-3 inline-block text-sm text-(--accent)">
                    下载正文
                  </Link>
                ) : null}
              </div>
              {item.attachments.map((attachment) => (
                <div key={attachment.id} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                  <p className="font-medium text-foreground">{attachment.fileName}</p>
                  <p className="mt-2 text-(--muted)">
                    {attachment.kind} · {attachment.size ? `${Math.ceil(attachment.size / 1024)} KB` : '附件'}
                  </p>
                  {allowDownload ? (
                    <Link
                      href={`/api/cases/${item.id}/download?attachment=${attachment.id}`}
                      className="mt-3 inline-block text-sm text-(--accent)"
                    >
                      下载附件
                    </Link>
                  ) : null}
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-4xl border border-black/10 bg-(--panel) p-6 shadow-sm">
            <h2 className="text-2xl text-foreground">版权声明</h2>
            <p className="mt-4 text-sm leading-7 text-(--muted)">{item.copyrightStatement}</p>
            <div className="mt-4 text-sm text-(--muted)">
              <p>收藏数：{formatCompactNumber(item._count.collections)}</p>
              <p className="mt-2">下载记录：{formatCompactNumber(item._count.downloadRecords)}</p>
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

import Link from 'next/link';

import { CATEGORY_OPTIONS, CASE_STATUS_LABELS, CASE_TYPE_OPTIONS, COURSE_OPTIONS, SORT_LABELS } from '@/lib/catalog';
import { getCurrentUser } from '@/lib/auth';
import { listCases } from '@/lib/data';
import { accessLevelLabel, caseStatusLabel, formatCompactNumber, formatDate } from '@/lib/format';
import { canUploadCases } from '@/lib/permissions';
import { Select } from '@/components/ui/Select';

type SearchParams = Record<string, string | string[] | undefined>;

function getValue(searchParams: SearchParams, key: string) {
  const raw = searchParams[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

function buildPageHref(searchParams: SearchParams, page: number) {
  const params = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (!value || key === 'page') {
      return;
    }

    if (Array.isArray(value)) {
      value.forEach((entry) => entry && params.append(key, entry));
      return;
    }

    params.set(key, value);
  });

  params.set('page', String(page));
  return `/cases?${params.toString()}`;
}

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const resolvedSearchParams = await searchParams;
  const viewer = await getCurrentUser();
  const category = getValue(resolvedSearchParams, 'category') ?? '';
  const type = getValue(resolvedSearchParams, 'type') ?? '';
  const course = getValue(resolvedSearchParams, 'course') ?? '';
  const access = getValue(resolvedSearchParams, 'access') ?? '';
  const sort = getValue(resolvedSearchParams, 'sort') ?? 'latest';
  const status = getValue(resolvedSearchParams, 'status') ?? '';
  const q = getValue(resolvedSearchParams, 'q') ?? '';
  const page = Number(getValue(resolvedSearchParams, 'page') ?? '1');

  const data = await listCases(viewer, {
    q,
    category,
    type,
    course,
    access,
    sort,
    status,
    page: Number.isFinite(page) ? page : 1,
  });

  const statusOptions =
    viewer?.role === 'admin'
      ? [
          { value: '', label: '全部状态' },
          ...Object.entries(CASE_STATUS_LABELS).map(([value, label]) => ({ value, label })),
        ]
      : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">案例浏览与检索</p>
            <h1 className="mt-2 text-4xl text-[color:var(--ink)]">案例大厅</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              支持按标题、摘要、关键词、企业名称进行搜索，并可结合学科领域、案例类型、适用课程、权限范围和排序方式进行筛选。
            </p>
          </div>
          {canUploadCases(viewer) ? (
            <Link
              href="/cases/upload"
              className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a24628]"
            >
              上传新案例
            </Link>
          ) : null}
        </div>

        <form className="mt-8 grid gap-4 lg:grid-cols-[2fr_repeat(4,minmax(0,1fr))_1fr]">
          <input
            type="search"
            name="q"
            defaultValue={q}
            placeholder="搜索标题、关键词、企业名称或作者"
            className="rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm"
          />
          <Select 
            name="category" 
            defaultValue={category} 
            options={[
              { value: '', label: '全部学科' },
              ...CATEGORY_OPTIONS.map(item => ({ value: item, label: item }))
            ]} 
          />
          <Select 
            name="type" 
            defaultValue={type} 
            options={[
              { value: '', label: '全部类型' },
              ...CASE_TYPE_OPTIONS.map(item => ({ value: item, label: item }))
            ]} 
          />
          <Select 
            name="course" 
            defaultValue={course} 
            options={[
              { value: '', label: '全部课程' },
              ...COURSE_OPTIONS.map(item => ({ value: item, label: item }))
            ]} 
          />
          <Select 
            name="access" 
            defaultValue={access} 
            options={[
              { value: '', label: '全部权限' },
              { value: 'public', label: '公开共享' },
              { value: 'campus', label: '仅校内使用' },
              { value: 'restricted', label: '仅限授权群体' },
            ]} 
          />
          <div className="flex gap-3">
            <Select 
              name="sort" 
              defaultValue={sort} 
              className="min-w-0 grow"
              options={Object.entries(SORT_LABELS).map(([value, label]) => ({ value, label }))} 
            />
            <button
              type="submit"
              className="rounded-2xl bg-[color:var(--accent-dark)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f2535]"
            >
              筛选
            </button>
          </div>
          {statusOptions.length > 0 ? (
            <Select
              name="status"
              defaultValue={status}
              className="lg:col-span-2"
              options={statusOptions}
            />
          ) : null}
        </form>
      </section>

      <section className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-[2rem] border border-black/10 bg-[color:var(--panel)] px-6 py-4 shadow-sm">
        <p className="text-sm text-[color:var(--muted)]">
          共找到 <span className="font-semibold text-[color:var(--ink)]">{data.total}</span> 个案例结果
        </p>
        <p className="text-sm text-[color:var(--muted)]">
          当前排序：<span className="font-semibold text-[color:var(--ink)]">{SORT_LABELS[data.sort]}</span>
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {data.items.map((item) => (
          <article key={item.id} className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="max-w-4xl">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs text-[color:var(--accent)]">
                    {item.category}
                  </span>
                  <span className="rounded-full bg-[color:var(--accent-dark)]/10 px-3 py-1 text-xs text-[color:var(--accent-dark)]">
                    {item.type}
                  </span>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-[color:var(--muted)]">
                    {accessLevelLabel(item.accessLevel as 'public' | 'campus' | 'restricted')}
                  </span>
                  <span className="rounded-full bg-black/5 px-3 py-1 text-xs text-[color:var(--muted)]">
                    {caseStatusLabel(item.status as keyof typeof CASE_STATUS_LABELS)}
                  </span>
                </div>
                <h2 className="mt-4 text-2xl leading-tight text-[color:var(--ink)]">
                  <Link href={`/cases/${item.id}`} className="transition hover:text-[color:var(--accent)]">
                    {item.title}
                  </Link>
                </h2>
                <p className="mt-4 line-clamp-3 text-sm leading-7 text-[color:var(--muted)]">{item.abstract}</p>
              </div>
              <div className="min-w-[180px] rounded-2xl bg-white px-4 py-4 text-sm text-[color:var(--muted)]">
                <p>上传者：{item.uploader.name}</p>
                <p className="mt-2">适用课程：{item.course}</p>
                <p className="mt-2">发布时间：{formatDate(item.publishedAt ?? item.createdAt)}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-black/10 pt-4 text-sm text-[color:var(--muted)]">
              <div className="flex flex-wrap gap-4">
                <span>浏览 {formatCompactNumber(item.views)}</span>
                <span>下载 {formatCompactNumber(item.downloads)}</span>
                <span>收藏 {formatCompactNumber(item._count.collections)}</span>
                <span>附件 {formatCompactNumber(item._count.attachments)}</span>
              </div>
              <Link href={`/cases/${item.id}`} className="text-[color:var(--accent)] transition hover:text-[#a24628]">
                查看详情
              </Link>
            </div>
          </article>
        ))}
      </section>

      {data.totalPages > 1 ? (
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-2">
          {Array.from({ length: data.totalPages }, (_, index) => index + 1).map((itemPage) => (
            <Link
              key={itemPage}
              href={buildPageHref(resolvedSearchParams, itemPage)}
              className={`rounded-full px-4 py-2 text-sm transition ${
                itemPage === data.page
                  ? 'bg-[color:var(--accent-dark)] text-white'
                  : 'border border-black/10 bg-[color:var(--panel)] text-[color:var(--ink)] hover:bg-black/5'
              }`}
            >
              {itemPage}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}

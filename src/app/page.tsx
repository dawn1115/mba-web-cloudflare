import Link from 'next/link';

import { getCurrentUser } from '@/lib/auth';
import { getHomePageData } from '@/lib/data';
import { formatCompactNumber, formatDate } from '@/lib/format';

export default async function Home() {
  const [viewer, homeData] = await Promise.all([getCurrentUser(), getHomePageData()]);

  return (
    <div className="pb-16">
      <section className="mx-auto max-w-7xl px-4 pt-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="relative overflow-hidden rounded-[2rem] border border-black/10 bg-[color:var(--accent-dark)] px-8 py-10 text-white shadow-[0_32px_80px_-48px_rgba(18,50,71,0.85)] sm:px-10">
            <div className="absolute -right-16 -top-10 h-40 w-40 rounded-full bg-white/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-56 w-56 rounded-full bg-[color:var(--accent)]/20 blur-3xl" />
            <p className="relative text-xs uppercase tracking-[0.32em] text-white/70">Anhui Normal University MBA</p>
            <h1 className="relative mt-5 max-w-3xl text-4xl leading-tight sm:text-5xl">
              探索商业智慧，赋能管理实践
            </h1>
            <p className="relative mt-6 max-w-2xl text-base leading-8 text-white/80">
              欢迎来到安徽师范大学科技商学院管理案例库。这里汇聚了丰富的商业实战案例，为师生提供优质的教学与研究资源，致力于培养具有创新精神和实干能力的卓越管理人才。
            </p>
            <div className="relative mt-8 flex flex-wrap gap-3">
              <Link
                href="/cases"
                className="rounded-full bg-white px-5 py-3 text-sm font-medium text-[color:var(--accent-dark)] transition hover:-translate-y-0.5"
              >
                进入案例大厅
              </Link>
              <Link
                href={viewer ? '/cases/upload' : '/login'}
                className="rounded-full border border-white/20 px-5 py-3 text-sm text-white transition hover:bg-white/10"
              >
                {viewer ? '提交案例审核' : '登录后上传案例'}
              </Link>
              <Link
                href={viewer ? '/me' : '/register'}
                className="rounded-full border border-white/20 px-5 py-3 text-sm text-white transition hover:bg-white/10"
              >
                {viewer ? '查看个人中心' : '注册新账号'}
              </Link>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">平台公告</p>
                <h2 className="mt-2 text-2xl text-[color:var(--ink)]">近期通知</h2>
              </div>
              <span className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs text-[color:var(--accent)]">
                {homeData.notices.length} 条
              </span>
            </div>
            <div className="mt-5 space-y-4">
              {homeData.notices.map((notice) => (
                <div key={notice.id} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-[color:var(--ink)]">{notice.title}</p>
                    {notice.isPinned ? (
                      <span className="rounded-full bg-[color:var(--accent-dark)] px-2 py-1 text-[10px] tracking-[0.18em] text-white">
                        PIN
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{notice.content}</p>
                  <p className="mt-3 text-xs text-[color:var(--muted)]">
                    {notice.author.name} · {formatDate(notice.publishedAt)}
                  </p>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </section>

      <section className="mx-auto mt-8 grid max-w-7xl gap-4 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-5 lg:px-8">
        <div className="rounded-[1.75rem] border border-black/10 bg-[color:var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[color:var(--muted)]">已发布案例</p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">
            {formatCompactNumber(homeData.stats.caseCount)}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-[color:var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[color:var(--muted)]">累计下载</p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">
            {formatCompactNumber(homeData.stats.downloadCount)}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-[color:var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[color:var(--muted)]">累计浏览</p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">
            {formatCompactNumber(homeData.stats.viewCount)}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-[color:var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[color:var(--muted)]">注册用户</p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">
            {formatCompactNumber(homeData.stats.userCount)}
          </p>
        </div>
        <div className="rounded-[1.75rem] border border-black/10 bg-[color:var(--panel)] p-5 shadow-sm">
          <p className="text-sm text-[color:var(--muted)]">活跃账号</p>
          <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">
            {formatCompactNumber(homeData.stats.activeUserCount)}
          </p>
        </div>
      </section>

      <section className="mx-auto mt-14 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">精选案例</p>
            <h2 className="mt-2 text-3xl text-[color:var(--ink)]">高关注度案例</h2>
          </div>
          <Link href="/cases" className="text-sm text-[color:var(--accent)] transition hover:text-[#a24628]">
            查看全部案例
          </Link>
        </div>
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {homeData.featuredCases.map((item, index) => (
            <article
              key={item.id}
              className="group overflow-hidden rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm transition hover:-translate-y-1"
            >
              <div className="flex items-center justify-between">
                <span className="rounded-full bg-[color:var(--accent)]/10 px-3 py-1 text-xs text-[color:var(--accent)]">
                  推荐 {index + 1}
                </span>
                <span className="text-xs text-[color:var(--muted)]">{item.category}</span>
              </div>
              <h3 className="mt-5 text-2xl leading-tight text-[color:var(--ink)] group-hover:text-[color:var(--accent)]">
                <Link href={`/cases/${item.id}`}>{item.title}</Link>
              </h3>
              <p className="mt-4 line-clamp-4 text-sm leading-7 text-[color:var(--muted)]">{item.abstract}</p>
              <div className="mt-6 flex items-center justify-between text-xs text-[color:var(--muted)]">
                <span>{item.course}</span>
                <span>{formatCompactNumber(item.downloads)} 次下载</span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto mt-14 grid max-w-7xl gap-8 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">最新发布</p>
          <div className="mt-5 space-y-4">
            {homeData.latestCases.map((item) => (
              <Link
                key={item.id}
                href={`/cases/${item.id}`}
                className="flex items-start justify-between gap-4 rounded-2xl border border-black/10 bg-white px-4 py-4 transition hover:border-[color:var(--accent)]/30"
              >
                <div>
                  <p className="font-medium text-[color:var(--ink)]">{item.title}</p>
                  <p className="mt-2 text-sm leading-7 text-[color:var(--muted)]">{item.course}</p>
                </div>
                <span className="shrink-0 text-xs text-[color:var(--muted)]">{formatDate(item.publishedAt)}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
          <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">分类分布</p>
          <div className="mt-5 space-y-4">
            {homeData.categoryGroups.map((item) => (
              <div key={item.category}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-[color:var(--ink)]">{item.category}</span>
                  <span className="text-[color:var(--muted)]">{item.count} 篇</span>
                </div>
                <div className="h-3 rounded-full bg-black/5">
                  <div
                    className="h-full rounded-full bg-[linear-gradient(90deg,#123247,#c65a35)]"
                    style={{
                      width: `${Math.max(
                        16,
                        (item.count / Math.max(homeData.stats.caseCount, 1)) * 100,
                      )}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}

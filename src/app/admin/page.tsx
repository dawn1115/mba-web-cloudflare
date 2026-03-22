import Link from 'next/link';

import SubmitButton from '@/components/forms/SubmitButton';
import { requireAdmin } from '@/lib/auth';
import { getAdminDashboardData } from '@/lib/data';
import { formatDate, formatDateTime, roleLabel, userStatusLabel } from '@/lib/format';

import { approveUserAction, createNoticeAction, deleteNoticeAction, disableUserAction, reviewCaseAction } from './actions';
import { DeleteNoticeButton } from './DeleteNoticeButton';

export default async function AdminPage() {
  await requireAdmin();
  const data = await getAdminDashboardData();

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-8 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Admin Console</p>
            <h1 className="mt-2 text-4xl text-[color:var(--ink)]">管理后台</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
              统一处理用户审核、案例审核、公告发布、分类统计与操作日志，覆盖需求文档中的核心管理场景。
            </p>
          </div>
          <Link
            href="/api/admin/report"
            className="rounded-full bg-[color:var(--accent-dark)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#0f2535]"
          >
            导出统计报表
          </Link>
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {[
          ['注册用户', data.metrics.totalUsers],
          ['待审用户', data.metrics.pendingUsers],
          ['案例总数', data.metrics.totalCases],
          ['待审案例', data.metrics.pendingCases],
          ['公告总数', data.metrics.noticeCount],
        ].map(([label, value]) => (
          <div key={label} className="rounded-[1.75rem] border border-black/10 bg-[color:var(--panel)] p-5 shadow-sm">
            <p className="text-sm text-[color:var(--muted)]">{label}</p>
            <p className="mt-2 text-3xl font-semibold text-[color:var(--ink)]">{value}</p>
          </div>
        ))}
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-[color:var(--ink)]">待审核用户</h2>
              <span className="text-sm text-[color:var(--muted)]">{data.recentUsers.length} 条</span>
            </div>
            <div className="mt-5 space-y-4">
              {data.recentUsers.length ? (
                data.recentUsers.map((user) => (
                  <div key={user.id} className="rounded-[1.5rem] border border-black/10 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-medium text-[color:var(--ink)]">{user.name}</p>
                        <p className="mt-2 text-sm text-[color:var(--muted)]">
                          {user.email} · {user.identifier ?? '未填写编号'}
                        </p>
                        <p className="mt-2 text-sm text-[color:var(--muted)]">
                          {roleLabel(user.role as 'admin' | 'pro' | 'teacher' | 'student' | 'normal')} · {userStatusLabel(user.status as 'pending' | 'active' | 'disabled')}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <form action={approveUserAction} className="flex items-center gap-2">
                          <input type="hidden" name="userId" value={user.id} />
                          <select name="role" defaultValue={user.role} className="rounded-full border border-black/10 px-3 py-2 text-sm">
                            <option value="student">学生</option>
                            <option value="teacher">教师</option>
                            <option value="normal">外部用户</option>
                            <option value="pro">Pro 用户</option>
                          </select>
                          <button type="submit" className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm text-white">
                            激活
                          </button>
                        </form>
                        <form action={disableUserAction}>
                          <input type="hidden" name="userId" value={user.id} />
                          <button type="submit" className="rounded-full border border-black/10 px-4 py-2 text-sm text-[color:var(--ink)]">
                            停用
                          </button>
                        </form>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted)]">当前没有待审核用户。</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <h2 className="text-2xl text-[color:var(--ink)]">发布公告</h2>
            <form action={createNoticeAction} className="mt-5 space-y-4">
              <label className="grid gap-2 text-sm">
                <span>公告标题</span>
                <input name="title" required className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>公告内容</span>
                <textarea name="content" rows={5} required className="rounded-[1.5rem] border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="flex items-center gap-3 text-sm text-[color:var(--muted)]">
                <input name="isPinned" type="checkbox" className="h-4 w-4 rounded border-black/20" />
                置顶公告
              </label>
              <SubmitButton
                idleText="发布公告"
                pendingText="发布中..."
                className="rounded-full bg-[color:var(--accent-dark)] px-5 py-3 text-sm text-white disabled:opacity-60"
              />
            </form>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <h2 className="text-2xl text-[color:var(--ink)]">管理公告</h2>
            <div className="mt-5 space-y-4">
              {data.recentNotices.length ? (
                data.recentNotices.map((notice) => (
                  <div key={notice.id} className="rounded-2xl border border-black/10 bg-white p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[color:var(--ink)]">{notice.title}</p>
                          {notice.isPinned && (
                            <span className="rounded-full bg-[color:var(--accent-dark)] px-2 py-0.5 text-[10px] tracking-wider text-white">
                              置顶
                            </span>
                          )}
                        </div>
                        <p className="mt-1 line-clamp-2 text-sm text-[color:var(--muted)]">{notice.content}</p>
                        <p className="mt-2 text-xs text-[color:var(--muted)]">
                          {formatDate(notice.publishedAt)}
                        </p>
                      </div>
                      <form action={deleteNoticeAction}>
                        <input type="hidden" name="noticeId" value={notice.id} />
                        <DeleteNoticeButton />
                      </form>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted)]">当前没有已发布的公告。</p>
              )}
            </div>
          </section>
        </div>

        <div className="space-y-8">
          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-[color:var(--ink)]">待审核案例</h2>
              <span className="text-sm text-[color:var(--muted)]">{data.reviewQueue.length} 条</span>
            </div>
            <div className="mt-5 space-y-4">
              {data.reviewQueue.length ? (
                data.reviewQueue.map((item) => (
                  <form key={item.id} action={reviewCaseAction} className="rounded-[1.5rem] border border-black/10 bg-white p-4">
                    <input type="hidden" name="caseId" value={item.id} />
                    <p className="font-medium text-[color:var(--ink)]">{item.title}</p>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      上传者：{item.uploader.name} · {item.category} · {formatDate(item.createdAt)}
                    </p>
                    <textarea
                      name="reviewComment"
                      rows={3}
                      placeholder="填写审核意见，可用于通过、退回或归档说明。"
                      className="mt-4 w-full rounded-[1.25rem] border border-black/10 bg-[color:var(--panel)] px-4 py-3 text-sm"
                    />
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button name="status" value="approved" className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm text-white">
                        审核通过
                      </button>
                      <button name="status" value="rejected" className="rounded-full border border-black/10 px-4 py-2 text-sm text-[color:var(--ink)]">
                        退回修改
                      </button>
                      <button name="status" value="archived" className="rounded-full border border-black/10 px-4 py-2 text-sm text-[color:var(--ink)]">
                        归档
                      </button>
                      <Link href={`/cases/${item.id}`} className="rounded-full border border-black/10 px-4 py-2 text-sm text-[color:var(--ink)]">
                        查看详情
                      </Link>
                    </div>
                  </form>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted)]">当前没有待审核案例。</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <h2 className="text-2xl text-[color:var(--ink)]">案例分类统计</h2>
            <div className="mt-5 space-y-4">
              {data.categoryGroups.map((item) => (
                <div key={item.category}>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-[color:var(--ink)]">{item.category}</span>
                    <span className="text-[color:var(--muted)]">{item.count} 篇</span>
                  </div>
                  <div className="h-3 rounded-full bg-black/5">
                    <div
                      className="h-full rounded-full bg-[linear-gradient(90deg,#123247,#c65a35)]"
                      style={{
                        width: `${Math.max(12, (item.count / Math.max(data.metrics.totalCases, 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <h2 className="text-2xl text-[color:var(--ink)]">近期日志</h2>
            <div className="mt-5 space-y-3">
              {data.latestLogs.map((log) => (
                <div key={log.id} className="rounded-2xl border border-black/10 bg-white px-4 py-4">
                  <p className="font-medium text-[color:var(--ink)]">{log.action}</p>
                  <p className="mt-2 text-sm text-[color:var(--muted)]">{log.detail ?? '无额外说明'}</p>
                  <p className="mt-2 text-xs text-[color:var(--muted)]">
                    {log.user?.name ?? '系统'} · {formatDateTime(log.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <h2 className="text-2xl text-[color:var(--ink)]">近期公告</h2>
            <div className="mt-5 space-y-3">
              {data.recentNotices.map((notice) => (
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
                  <p className="mt-2 text-xs text-[color:var(--muted)]">
                    {notice.author.name} · {formatDate(notice.publishedAt)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

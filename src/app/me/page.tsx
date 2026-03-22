import Link from 'next/link';

import SubmitButton from '@/components/forms/SubmitButton';
import { requireUser } from '@/lib/auth';
import { getUserCenterData } from '@/lib/data';
import { caseStatusLabel, formatDate, formatDateTime, roleLabel, userStatusLabel } from '@/lib/format';
import { canUploadCases } from '@/lib/permissions';

import { updatePasswordAction, updateProfileAction } from './actions';

export default async function MePage() {
  const viewer = await requireUser();
  const profile = await getUserCenterData(viewer.id);

  if (!profile) {
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Personal Center</p>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl text-[color:var(--ink)]">{profile.name}</h1>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              {roleLabel(viewer.role)} · {userStatusLabel(viewer.status)} · 最近登录 {formatDateTime(profile.lastLoginAt)}
            </p>
          </div>
          {canUploadCases(viewer) ? (
            <Link
              href="/cases/upload"
              className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a24628]"
            >
              提交新案例
            </Link>
          ) : null}
        </div>
      </section>

      <section className="mt-8 grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-8">
          <form action={updateProfileAction} className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <h2 className="text-2xl text-[color:var(--ink)]">基本资料</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span>姓名</span>
                <input name="name" defaultValue={profile.name} required className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>邮箱</span>
                <input value={profile.email} disabled className="rounded-2xl border border-black/10 bg-black/5 px-4 py-3 text-[color:var(--muted)]" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>手机号</span>
                <input name="phone" defaultValue={profile.phone ?? ''} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>工号 / 学号</span>
                <input name="identifier" defaultValue={profile.identifier ?? ''} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>专业方向</span>
                <input name="major" defaultValue={profile.major ?? ''} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>院系 / 单位</span>
                <input name="department" defaultValue={profile.department ?? ''} className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm md:col-span-2">
                <span>个人简介</span>
                <textarea
                  name="bio"
                  rows={4}
                  defaultValue={profile.bio ?? ''}
                  className="rounded-[1.5rem] border border-black/10 bg-white px-4 py-3"
                />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <SubmitButton
                idleText="保存资料"
                pendingText="保存中..."
                className="rounded-full bg-[color:var(--accent-dark)] px-5 py-3 text-sm text-white disabled:opacity-60"
              />
            </div>
          </form>

          <form action={updatePasswordAction} className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <h2 className="text-2xl text-[color:var(--ink)]">修改密码</h2>
            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label className="grid gap-2 text-sm">
                <span>当前密码</span>
                <input name="currentPassword" type="password" required className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>新密码</span>
                <input name="nextPassword" type="password" required className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
              <label className="grid gap-2 text-sm">
                <span>确认新密码</span>
                <input name="confirmPassword" type="password" required className="rounded-2xl border border-black/10 bg-white px-4 py-3" />
              </label>
            </div>
            <div className="mt-5 flex justify-end">
              <SubmitButton
                idleText="更新密码"
                pendingText="更新中..."
                className="rounded-full border border-black/10 px-5 py-3 text-sm text-[color:var(--ink)] disabled:opacity-60"
              />
            </div>
          </form>
        </div>

        <div className="space-y-8">
          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-[color:var(--ink)]">我的上传</h2>
              <span className="text-sm text-[color:var(--muted)]">{profile.uploadedCases.length} 条</span>
            </div>
            <div className="mt-5 space-y-3">
              {profile.uploadedCases.length ? (
                profile.uploadedCases.map((item) => (
                  <Link key={item.id} href={`/cases/${item.id}`} className="block rounded-2xl border border-black/10 bg-white px-4 py-4">
                    <p className="font-medium text-[color:var(--ink)]">{item.title}</p>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">
                      {caseStatusLabel(item.status as 'pending' | 'approved' | 'rejected' | 'archived')} · {formatDate(item.createdAt)}
                    </p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted)]">暂无上传记录。</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-[color:var(--ink)]">收藏案例</h2>
              <span className="text-sm text-[color:var(--muted)]">{profile.collections.length} 条</span>
            </div>
            <div className="mt-5 space-y-3">
              {profile.collections.length ? (
                profile.collections.map((item) => (
                  <Link key={item.id} href={`/cases/${item.caseRef.id}`} className="block rounded-2xl border border-black/10 bg-white px-4 py-4">
                    <p className="font-medium text-[color:var(--ink)]">{item.caseRef.title}</p>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">收藏于 {formatDate(item.createdAt)}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted)]">暂无收藏记录。</p>
              )}
            </div>
          </section>

          <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl text-[color:var(--ink)]">下载记录</h2>
              <span className="text-sm text-[color:var(--muted)]">{profile.downloadRecords.length} 条</span>
            </div>
            <div className="mt-5 space-y-3">
              {profile.downloadRecords.length ? (
                profile.downloadRecords.map((item) => (
                  <Link key={item.id} href={`/cases/${item.caseRef.id}`} className="block rounded-2xl border border-black/10 bg-white px-4 py-4">
                    <p className="font-medium text-[color:var(--ink)]">{item.caseRef.title}</p>
                    <p className="mt-2 text-sm text-[color:var(--muted)]">下载于 {formatDateTime(item.createdAt)}</p>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-[color:var(--muted)]">暂无下载记录。</p>
              )}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

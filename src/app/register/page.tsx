'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useActionState } from 'react';
import { registerAction } from '@/app/actions';
import SubmitButton from '@/components/forms/SubmitButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

export default function RegisterPage() {
  const [state, formAction] = useActionState(registerAction, null);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
        <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-8 shadow-sm">
          <Image
            src="/brand-mark.svg"
            alt="安徽师范大学科技商学院管理案例库标识"
            width={56}
            height={56}
            className="rounded-2xl"
          />
          <p className="mt-6 text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">Registration Workflow</p>
          <h1 className="mt-2 text-4xl text-[color:var(--ink)]">提交账号申请</h1>
          <div className="mt-5 space-y-3 text-sm leading-7 text-[color:var(--muted)]">
            <p>1. 填写真实姓名、邮箱、角色与联系方式。</p>
            <p>2. 平台管理员审核后激活账号并分配对应权限。</p>
            <p>3. 审核通过后即可登录、收藏案例，Pro/管理员可继续上传与下载。</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-8 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">新用户注册</p>
            <h2 className="mt-2 text-3xl text-[color:var(--ink)]">创建申请</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              已有账号？<Link href="/login" className="text-[color:var(--accent)]">直接登录</Link>
            </p>
          </div>

          {state?.error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          <form action={formAction} className="mt-8 grid gap-5 md:grid-cols-2">
            <Input label="真实姓名" name="name" required />
            <Input label="邮箱" name="email" type="email" required />
            <div className="md:col-span-2">
              <Input label="手机号" name="phone" />
            </div>
            <Input label="设置密码" name="password" type="password" required />
            <Input label="确认密码" name="confirmPassword" type="password" required />

            <label className="md:col-span-2 flex items-start gap-3 rounded-[1.5rem] border border-black/10 bg-white px-4 py-4 text-sm text-[color:var(--muted)]">
              <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-black/20" />
              <span>我确认提交的身份信息真实有效，并同意平台审核与权限管理规则。</span>
            </label>

            <div className="md:col-span-2">
              <SubmitButton pendingText="提交中..." idleText="提交注册申请" className="w-full rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a24628] disabled:opacity-60" />
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

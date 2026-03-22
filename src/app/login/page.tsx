'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useActionState } from 'react';
import { loginAction } from '@/app/actions';
import SubmitButton from '@/components/forms/SubmitButton';
import { Input } from '@/components/ui/Input';

function LoginForm() {
  const searchParams = useSearchParams();
  const registered = searchParams.get('registered') === '1';
  
  const [state, formAction] = useActionState(loginAction, null);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl items-center px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid w-full gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-[2rem] border border-black/10 bg-[color:var(--accent-dark)] p-8 text-white shadow-[0_32px_80px_-48px_rgba(18,50,71,0.85)]">
          <Image
            src="/brand-mark.svg"
            alt="安徽师范大学科技商学院管理案例库标识"
            width={56}
            height={56}
            className="rounded-2xl"
          />
          <p className="mt-6 text-xs uppercase tracking-[0.28em] text-white/65">Secure Access</p>
          <h1 className="mt-3 text-4xl leading-tight">登录案例共享平台</h1>
          <p className="mt-5 text-sm leading-8 text-white/80">
            支持邮箱、手机号或工号/学号登录。审核通过后，账号会自动激活并获得对应权限。
          </p>
          <div className="mt-8 rounded-[1.5rem] border border-white/15 bg-white/10 p-5 text-sm leading-7 text-white/80">
            <p>演示管理员：`admin@ahnu.edu.cn`</p>
            <p>演示 Pro 用户：`pro@ahnu.edu.cn`</p>
            <p>统一密码：`Pass1234`</p>
          </div>
        </section>

        <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-8 shadow-sm">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">账号登录</p>
            <h2 className="mt-2 text-3xl text-[color:var(--ink)]">欢迎回来</h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
              没有账号？<Link href="/register" className="text-[color:var(--accent)]">先提交注册申请</Link>
            </p>
          </div>

          {registered ? (
            <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
              注册信息已提交，请等待管理员审核激活。
            </div>
          ) : null}

          {state?.error ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          <form action={formAction} className="mt-8 space-y-5">
            <Input
              label="邮箱 / 手机号 / 工号学号"
              name="loginId"
              required
            />
            <Input
              label="密码"
              name="password"
              type="password"
              required
            />

            <SubmitButton pendingText="登录中..." idleText="登录" className="w-full rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm font-medium text-white transition hover:bg-[#a24628] disabled:opacity-60" />
          </form>
        </section>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="px-4 py-20 text-center text-sm text-[color:var(--muted)]">加载中...</div>}>
      <LoginForm />
    </Suspense>
  );
}

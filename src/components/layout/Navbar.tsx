import Image from 'next/image';
import Link from 'next/link';

import { logoutAction } from '@/app/actions';
import { getCurrentUser } from '@/lib/auth';
import { ROLE_LABELS, USER_STATUS_LABELS } from '@/lib/catalog';

const primaryLinks = [
  { href: '/', label: '首页' },
  { href: '/cases', label: '案例大厅' },
  { href: '/cases/upload', label: '上传案例' },
  { href: '/about', label: '平台说明' },
];

export default async function Navbar() {
  const user = await getCurrentUser();

  return (
    <header className="border-b border-black/10 bg-[color:var(--panel)]/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex min-w-0 items-center gap-3">
          <Image
            src="/brand-mark.svg"
            alt="安徽师范大学 MBA 管理案例平台标识"
            width={44}
            height={44}
            className="rounded-2xl"
            priority
          />
          <div className="min-w-0">
            <p className="font-serif text-lg font-semibold tracking-wide text-[color:var(--ink)]">
              安徽师范大学科技商学院管理案例库
            </p>
          </div>
        </Link>

        <nav className="flex flex-wrap items-center gap-2 text-sm">
          {primaryLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-[color:var(--muted)] transition hover:bg-black/5 hover:text-[color:var(--ink)]"
            >
              {item.label}
            </Link>
          ))}
          {user?.role === 'admin' ? (
            <Link
              href="/admin"
              className="rounded-full bg-[color:var(--accent-dark)] px-4 py-2 text-white transition hover:bg-[#0f2535]"
            >
              管理后台
            </Link>
          ) : null}
        </nav>

        <div className="flex flex-wrap items-center gap-3">
          {user ? (
            <>
              <Link
                href="/me"
                className="rounded-2xl border border-black/10 bg-white px-4 py-2 text-sm text-[color:var(--ink)] shadow-sm transition hover:-translate-y-0.5"
              >
                <span className="block font-medium">{user.name}</span>
                <span className="block text-xs text-[color:var(--muted)]">
                  {ROLE_LABELS[user.role]} · {USER_STATUS_LABELS[user.status]}
                </span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="rounded-full border border-black/10 px-4 py-2 text-sm text-[color:var(--ink)] transition hover:bg-black/5"
                >
                  退出登录
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full border border-black/10 px-4 py-2 text-sm text-[color:var(--ink)] transition hover:bg-black/5"
              >
                登录
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-[color:var(--accent)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#a24628]"
              >
                注册
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

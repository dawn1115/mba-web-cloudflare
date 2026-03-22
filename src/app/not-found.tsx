import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-10 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">404</p>
        <h1 className="mt-4 text-4xl text-[color:var(--ink)]">没有找到对应内容</h1>
        <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
          你访问的页面可能不存在，或当前链接已经失效。
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Link href="/" className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm text-white">
            回到首页
          </Link>
          <Link href="/cases" className="rounded-full border border-black/10 px-5 py-3 text-sm text-[color:var(--ink)]">
            浏览案例
          </Link>
        </div>
      </div>
    </div>
  );
}

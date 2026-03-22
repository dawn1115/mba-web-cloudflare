import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-black/10 bg-[color:var(--panel)]">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 text-sm sm:px-6 lg:grid-cols-[1.2fr_0.8fr_1fr] lg:px-8">
        <div>
          <p className="font-serif text-2xl text-[color:var(--ink)]">案例共享平台</p>
          <p className="mt-3 max-w-xl leading-7 text-[color:var(--muted)]">
            面向安徽师范大学 MBA 教育中心的案例沉淀、审核、共享与统计平台，支持案例上传、检索、下载、收藏、归档和公告发布。
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">快速入口</p>
          <div className="mt-4 flex flex-col gap-3">
            <Link href="/cases" className="text-[color:var(--ink)] transition hover:text-[color:var(--accent)]">
              浏览案例大厅
            </Link>
            <Link href="/cases/upload" className="text-[color:var(--ink)] transition hover:text-[color:var(--accent)]">
              提交案例审核
            </Link>
            <Link href="/me" className="text-[color:var(--ink)] transition hover:text-[color:var(--accent)]">
              个人中心
            </Link>
            <Link href="/about" className="text-[color:var(--ink)] transition hover:text-[color:var(--accent)]">
              平台说明
            </Link>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.22em] text-[color:var(--muted)]">联系信息</p>
          <div className="mt-4 space-y-3 text-[color:var(--ink)]">
            <p>安徽省芜湖市九华南路 189 号 安徽师范大学 MBA 教育中心</p>
            <p>邮箱：mba@ahnu.edu.cn</p>
            <p>电话：0553-1234567</p>
          </div>
        </div>
      </div>
      <div className="border-t border-black/10 px-4 py-4 text-center text-xs text-[color:var(--muted)] sm:px-6 lg:px-8">
        仅供教学与研究使用。案例版权归属以上传声明与平台审核结果为准。
      </div>
    </footer>
  );
}

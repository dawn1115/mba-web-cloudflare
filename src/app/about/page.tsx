const sections = [
  {
    title: '建设目标',
    content:
      '平台围绕“统一规范、分散建设、共同开发、资源共享”的目标建设，用于支撑 MBA 教育中心案例沉淀、课程教学和案例治理。',
  },
  {
    title: '核心能力',
    content:
      '当前实现覆盖用户注册审核、案例上传与审核、权限控制、案例检索、收藏下载、公告管理、统计分析和操作日志等核心流程。',
  },
  {
    title: '使用建议',
    content:
      '普通用户以浏览、检索和收藏为主，Pro 用户和管理员可以上传或下载案例，管理员负责审核发布、公告维护与权限调整。',
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-4xl border border-black/10 bg-(--panel) p-8 shadow-sm">
        <p className="text-xs uppercase tracking-[0.24em] text-(--muted)">Platform Brief</p>
        <h1 className="mt-2 text-4xl text-foreground">平台说明</h1>
        <p className="mt-4 text-sm leading-8 text-(--muted)">
          安徽师范大学科技商学院管理案例库服务于案例建设、审核发布、课程使用和运营分析，帮助教学团队将案例资产从零散文件转变为可治理、可复用、可统计的平台资源。
        </p>
      </section>

      <section className="mt-8 grid gap-5">
        {sections.map((item) => (
          <article key={item.title} className="rounded-4xl border border-black/10 bg-(--panel) p-6 shadow-sm">
            <h2 className="text-2xl text-foreground">{item.title}</h2>
            <p className="mt-3 text-sm leading-8 text-(--muted)">{item.content}</p>
          </article>
        ))}
      </section>
    </div>
  );
}

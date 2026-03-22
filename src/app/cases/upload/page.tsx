import Link from 'next/link';

import SubmitButton from '@/components/forms/SubmitButton';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { FileInput } from '@/components/ui/FileInput';
import { CATEGORY_OPTIONS, CASE_TYPE_OPTIONS, COURSE_OPTIONS } from '@/lib/catalog';
import { getCurrentUser } from '@/lib/auth';
import { canUploadCases } from '@/lib/permissions';

import { submitCaseAction } from './actions';

type SearchParams = Record<string, string | string[] | undefined>;

function getValue(searchParams: SearchParams, key: string) {
  const raw = searchParams[key];
  return Array.isArray(raw) ? raw[0] : raw;
}

export default async function CaseUploadPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const viewer = await getCurrentUser();
  const resolvedSearchParams = await searchParams;
  const submitted = getValue(resolvedSearchParams, 'submitted') === '1';
  const invalid = getValue(resolvedSearchParams, 'invalid') === '1';
  const forbidden = getValue(resolvedSearchParams, 'forbidden') === '1';
  const caseId = getValue(resolvedSearchParams, 'caseId');

  if (!viewer) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-10 shadow-sm">
          <h1 className="text-3xl text-[color:var(--ink)]">登录后才能提交案例</h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            平台会记录上传人、审核意见和版权声明。请先登录已激活账号。
          </p>
          <div className="mt-6 flex justify-center gap-3">
            <Link href="/login" className="rounded-full bg-[color:var(--accent)] px-5 py-3 text-sm text-white">
              前往登录
            </Link>
            <Link href="/register" className="rounded-full border border-black/10 px-5 py-3 text-sm text-[color:var(--ink)]">
              注册账号
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!canUploadCases(viewer)) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-10 shadow-sm">
          <h1 className="text-3xl text-[color:var(--ink)]">当前账号没有上传权限</h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)]">
            按当前权限模型，案例上传功能面向管理员和 Pro 用户开放。若你需要承担案例建设任务，请联系管理员调整权限。
          </p>
          <Link href="/me" className="mt-6 inline-flex rounded-full border border-black/10 px-5 py-3 text-sm text-[color:var(--ink)]">
            返回个人中心
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <section className="rounded-[2rem] border border-black/10 bg-[color:var(--panel)] p-6 shadow-sm sm:p-8">
        <p className="text-xs uppercase tracking-[0.24em] text-[color:var(--muted)]">案例上传与版权确认</p>
        <h1 className="mt-2 text-4xl text-[color:var(--ink)]">提交新案例</h1>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">
          上传正文文档并补充摘要、关键词、课程、企业背景、开发年份和版权说明。案例提交后会进入审核流，通过后才会对外展示。
        </p>

        {submitted ? (
          <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-700">
            案例已提交审核。{caseId ? <Link href={`/cases/${caseId}`} className="font-medium underline">查看提交详情</Link> : null}
          </div>
        ) : null}
        {invalid ? (
          <div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-700">
            提交失败，请检查必填字段、正文文件格式和文件大小。
          </div>
        ) : null}
        {forbidden ? (
          <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
            当前账号权限不足，无法提交案例。
          </div>
        ) : null}

        <form action={submitCaseAction} className="mt-8 grid gap-8">
          <div className="grid gap-5 md:grid-cols-2">
            <Input label="案例标题" name="title" required />
            <Input label="作者署名" name="author" defaultValue={viewer.name} />
            <Select 
              label="学科领域" 
              name="category" 
              required
              options={[
                { value: '', label: '请选择' },
                ...CATEGORY_OPTIONS.map(item => ({ value: item, label: item }))
              ]} 
            />
            <Select 
              label="案例类型" 
              name="type" 
              required
              options={[
                { value: '', label: '请选择' },
                ...CASE_TYPE_OPTIONS.map(item => ({ value: item, label: item }))
              ]} 
            />
            <Select 
              label="适用课程" 
              name="course" 
              required
              options={[
                { value: '', label: '请选择' },
                ...COURSE_OPTIONS.map(item => ({ value: item, label: item }))
              ]} 
            />
            <Input label="企业背景" name="company" />
            <Input label="开发年份" name="developmentYear" type="number" min="2000" max="2099" />
            <Select 
              label="使用权限" 
              name="accessLevel" 
              defaultValue="public"
              options={[
                { value: 'public', label: '公开共享' },
                { value: 'campus', label: '仅校内使用' },
                { value: 'restricted', label: '仅限授权群体' },
              ]} 
            />
          </div>

          <Input
            label="关键词"
            name="keywords"
            required
            placeholder="多个关键词请用中文逗号分隔"
          />

          <label className="grid gap-2 text-sm">
            <span className="text-[color:var(--ink)]">案例摘要</span>
            <textarea
              name="abstract"
              required
              rows={6}
              className="rounded-[1.5rem] border border-black/10 bg-white px-4 py-3"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="text-[color:var(--ink)]">版权声明</span>
            <textarea
              name="copyrightStatement"
              required
              rows={4}
              className="rounded-[1.5rem] border border-black/10 bg-white px-4 py-3"
              placeholder="请说明版权归属、是否获得企业授权、适用范围等。"
            />
          </label>

          <div className="grid gap-5 md:grid-cols-2">
            <FileInput
              label="正文文件 (仅限 PDF)"
              name="primaryFile"
              accept=".pdf,application/pdf"
              required
            />
            <FileInput
              label="补充附件"
              name="attachments"
              multiple
            />
          </div>

          <label className="flex items-start gap-3 rounded-[1.5rem] border border-black/10 bg-white px-4 py-4 text-sm text-[color:var(--muted)]">
            <input type="checkbox" required className="mt-1 h-4 w-4 rounded border-black/20" />
            <span>
              我确认上传内容真实、完整、具备合法版权来源，并接受平台审核、退回修改和归档管理规则。
            </span>
          </label>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs leading-6 text-[color:var(--muted)]">
              正文文件仅支持 PDF 格式。单个文件上限 50 MB。建议在补充附件中上传教学说明、数据附件或图表文件。
            </p>
            <SubmitButton
              idleText="提交审核"
              pendingText="提交中..."
              className="rounded-full bg-[color:var(--accent)] px-6 py-3 text-sm font-medium text-white transition disabled:opacity-60"
            />
          </div>
        </form>
      </section>
    </div>
  );
}

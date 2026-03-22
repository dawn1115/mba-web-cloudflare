import type { Metadata } from 'next';

import Footer from '@/components/layout/Footer';
import Navbar from '@/components/layout/Navbar';

import './globals.css';

export const metadata: Metadata = {
  title: '安徽师范大学科技商学院管理案例库',
  description:
    '面向安徽师范大学 MBA 教育中心的案例上传、审核、共享与统计平台，支持案例检索、公告发布、权限管理和教学资源沉淀。',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen text-[color:var(--ink)]">
        <div className="relative min-h-screen overflow-x-hidden">
          <Navbar />
          <main>{children}</main>
          <Footer />
        </div>
      </body>
    </html>
  );
}

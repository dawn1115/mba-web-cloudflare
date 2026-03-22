import type { NextConfig } from "next";

// 本地开发时挂载 Cloudflare 平台模拟（D1、R2 等）
if (process.env.NODE_ENV === "development") {
  void import("@opennextjs/cloudflare").then(({ initOpenNextCloudflareForDev }) =>
    initOpenNextCloudflareForDev(),
  );
}

const nextConfig: NextConfig = {
  reactCompiler: true,
};

export default nextConfig;

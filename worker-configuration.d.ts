/**
 * 扩展 @opennextjs/cloudflare 的全局 CloudflareEnv 接口
 * 对应 wrangler.toml 中的 d1_databases 和 r2_buckets 绑定
 */

declare global {
  interface CloudflareEnv {
    /** D1 数据库绑定（mba-web-db） */
    DB: D1Database;
    /** R2 存储桶绑定（mba-web-files） */
    FILES: R2Bucket;
    /** JWT 签名密钥 */
    JWT_SECRET?: string;
  }
}

export {};

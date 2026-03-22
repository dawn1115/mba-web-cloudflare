# Cloudflare Workers（OpenNext）部署指南

本项目已针对 Cloudflare Workers（OpenNext）进行了完整适配：
- **数据库**：Cloudflare D1（SQLite 兼容）+ Prisma `@prisma/adapter-d1`
- **文件存储**：Cloudflare R2（对象存储）
- **密码哈希**：Web Crypto PBKDF2（替代 bcryptjs）
- **JWT**：Web Crypto HMAC-SHA256（替代 jsonwebtoken）

---

## 一、前置准备

确保已安装并登录 Wrangler CLI：

```bash
npm install -g wrangler
wrangler login
```

---

## 二、创建 D1 数据库

```bash
wrangler d1 create mba-web-db
```

复制输出中的 `database_id`，填入 `wrangler.toml`：

```toml
[[d1_databases]]
binding = "DB"
database_name = "mba-web-db"
database_id = "粘贴你的 database_id"
```

---

## 三、创建 R2 存储桶

```bash
wrangler r2 bucket create mba-web-files
```

---

## 四、执行数据库迁移

```bash
# 应用到远程 D1（生产）
npm run db:migrate:remote

# 或应用到本地 D1（本地测试）
npm run db:migrate:local
```

---

## 五、配置生产环境密钥

在 Cloudflare Dashboard → Workers & Pages → 你的 Worker → Settings → Variables 中添加：

| 变量名 | 值 | 环境 |
|---|---|---|
| `JWT_SECRET` | 随机强密码（建议 32 位以上） | Production + Preview |

或使用 wrangler：

```bash
wrangler secret put JWT_SECRET
```

---

## 六、构建并部署

```bash
# 构建并部署到 Cloudflare Workers
npm run deploy
```

建议在 CI/CD（例如 GitHub Actions）中运行 `npm run deploy`，避免本机环境差异。

---

## 七、本地开发

```bash
# 复制环境变量模板
cp .dev.vars.example .dev.vars
# 编辑 .dev.vars，填入 JWT_SECRET

# 应用本地迁移
npm run db:migrate:local

# 启动 Next.js 开发服务器（会自动模拟 Cloudflare D1/R2 绑定）
npm run dev

# 使用 Workers 运行时预览（更接近线上）
npm run preview
```

---

## 八、密码格式说明

新系统使用 `PBKDF2` 哈希格式（`pbkdf2$<iterations>$<hex-salt>$<hex-hash>`），
与原系统的 bcrypt 格式（`$2b$...`）**不兼容**。

已有用户需通过「忘记密码」或管理员重置密码才能正常登录。

如需初始化演示数据（管理员账号），需单独在本地执行 seed 脚本：

```bash
DATABASE_URL=file:./dev.db npx tsx prisma/seed/admin.ts
```

> seed 脚本仍使用 bcryptjs（仅在本地 Node.js 环境运行），不影响 Cloudflare 部署。

# Vercel 部署指南

## 1. 环境变量

在 Vercel 项目设置中添加以下环境变量：

| 变量 | 说明 | 来源 |
|------|------|------|
| `DATABASE_URL` | PostgreSQL 连接串 | Vercel Postgres 或 Neon |
| `BLOB_READ_WRITE_TOKEN` | Vercel Blob 读写令牌 | Vercel Storage |
| `SESSION_SECRET` | 会话加密密钥 | 随机生成 32 字节 |
| `NEXT_PUBLIC_SITE_URL` | 站点完整 URL | https://your-domain.vercel.app |
| `BAIDU_ANALYTICS_ID` | 百度统计 ID | 百度统计后台 |

## 2. 数据库迁移

首次部署前执行：

```bash
npm run db:migrate
npm run db:seed:admin
```

管理员账号密码通过 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 环境变量传入，不写入代码。

## 3. 部署步骤

1. 推送代码到 GitHub
2. Vercel 导入仓库，自动识别 Next.js
3. 添加环境变量
4. 触发部署

## 4. 验证清单

- [ ] 首页可访问
- [ ] 文章/工具/商品列表正常
- [ ] 登录/注册可用
- [ ] 后台 /studio 可登录
- [ ] 百度统计脚本加载（生产环境）
- [ ] 图片上传正常（Blob）

# ValuePass 部署指南（Netlify）

> 最后更新：2026-11-09
> 当前生产地址：https://valuepass.netlify.app

---

## 1. 平台与架构

| 能力 | 选型 | 说明 |
|------|------|------|
| 网站托管 | **Netlify** | Next.js 15 App Router，经 `@netlify/plugin-nextjs` 适配为 Functions + 静态资源 |
| 数据库 | **Neon PostgreSQL** | 独立第三方服务，与托管平台解耦；连接串通过 `DATABASE_URL` 注入 |
| 图片存储 | **Netlify Blobs** | 生产环境自动可用；本地开发回退到项目 `uploads/` 目录 |
| 视频 | **Bilibili / 腾讯视频 / YouTube iframe** | 视频文件不落本站存储，仅保存嵌入代码 |
| 代码托管 | 暂未接入（手动部署） | 后续建议接入 GitHub 自动部署，见第 7 节 |

### 为什么不用 Vercel

Vercel 注册对国内手机号短信支持差，且账号风控会锁定验证通道。Netlify 可直接用邮箱/GitHub 登录，免费层足以支撑个人站。存储能力由 Netlify Blobs 提供，无需单独注册图床。

---

## 2. 环境变量

在 Netlify 控制台 **Project configuration → Environment variables** 中配置：

| 变量 | 必填 | 说明 |
|------|------|------|
| `DATABASE_URL` | ✅ | Neon PostgreSQL 池化连接串（`...-pooler...`） |
| `ADMIN_USERNAME` | ✅ | 管理员账号（种子脚本使用） |
| `ADMIN_PASSWORD` | ✅ | 管理员初始密码（种子脚本使用，不写入代码） |
| `NEXT_PUBLIC_SITE_URL` | ✅ | 站点完整 URL，如 `https://valuepass.netlify.app` |
| `BAIDU_ANALYTICS_ID` | 可选 | 百度统计 ID，生产环境自动加载脚本 |

**Netlify Blobs 不需要手动配置**：部署到 Netlify 后平台自动注入凭据，代码通过 `NETLIFY` / `NETLIFY_BLOBS_CONTEXT` 环境变量自动识别。

> 已废弃：`BLOB_READ_WRITE_TOKEN`（Vercel Blob）、`QINIU_*`（七牛）——代码已切换到 Netlify Blobs，无需配置。

---

## 3. 首次部署

### 3.1 前置条件

- Netlify 账号（邮箱或 GitHub 登录即可，无需手机验证）
- 项目已在本机可正常 `npm run build`

### 3.2 步骤

```bash
# 1. 登录（浏览器授权，或使用 Personal Access Token）
npx netlify login
#    无浏览器环境时：
npx netlify login --token <你的 Personal Access Token>

# 2. 创建并关联站点
npx netlify sites:create --name valuepass
#    或关联已有站点：
npx netlify link --id <SITE_ID>

# 3. 配置环境变量（控制台操作，见第 2 节）

# 4. 构建并部署到生产
npx netlify deploy --build --prod
```

部署成功后输出：

```
Production URL: https://valuepass.netlify.app
```

### 3.3 数据库迁移与管理员种子

数据库迁移和种子脚本**在本地执行**（连接生产的 Neon 连接串），不在 Netlify 构建期运行：

```bash
# PowerShell 下，解决 Neon IPv6 不可达问题
$env:NODE_OPTIONS = '--dns-result-order=ipv4first'

npm run db:migrate
npm run db:seed:admin
```

> **重要**：如果本机访问 Neon 报 `ECONNREFUSED`，几乎都是 IPv6 出口问题。加 `NODE_OPTIONS=--dns-result-order=ipv4first` 强制 IPv4 优先即可解决。

---

## 4. 访问权限（易踩坑）

Netlify 新建项目默认可能为 **Private**，导致所有页面返回 `401 Unauthorized`。

**解决**：Project configuration → General → Visitor access → **Edit visibility** → 把 **Production visibility** 改为 **Public**。

或者用 API 关闭：

```bash
curl -X PATCH https://api.netlify.com/api/v1/sites/<SITE_ID> \
  -H "Authorization: Bearer <TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"sso_login": false}'
```

---

## 5. 图片存储：Netlify Blobs

### 5.1 工作方式

| 环境 | 存储位置 | 读取方式 |
|------|----------|----------|
| 生产（Netlify） | Netlify Blobs（store: `valuepass-images`） | `/api/images/[filename]` 从 Blobs 读取 |
| 本地开发 | 项目根目录 `uploads/`（已加入 `.gitignore`） | 同一路由读本地文件 |

上传入口统一为 Server Action `uploadImageAction`（`src/lib/actions/upload.ts`），存储细节封装在 `src/lib/storage/images.ts`。

### 5.2 为什么图片 URL 是 `/api/images/xxx` 而不是 CDN 直链

Netlify Blobs 不提供公开直链，必须经站点自身 API 代理读取。好处：

- 图片 URL 与存储后端解耦，将来换存储只需改一个文件
- 已有文章中的图片路径不需要迁移

### 5.3 已验证

- 生产环境上传图片 → 预览正常
- **重新部署后图片依然存在**（Blobs 持久化，非临时文件系统）

---

## 6. 上线验证清单

```bash
# 页面可达性
curl -I https://valuepass.netlify.app/
curl -I https://valuepass.netlify.app/articles
curl -I https://valuepass.netlify.app/tools
curl -I https://valuepass.netlify.app/products
curl -I https://valuepass.netlify.app/about
```

- [ ] 所有公开页返回 200（非 401）
- [ ] 首页首屏、四个板块入口正常
- [ ] 文章/工具/商品详情可打开，Markdown 图片与视频 iframe 正常渲染
- [ ] 注册、登录、退出全流程可用
- [ ] 后台 `/studio` 可登录（冷启动约 5~10 秒属正常）
- [ ] 后台上传图片 → 预览成功 → 图片 URL 返回 `image/*`
- [ ] 重新部署一次 → 图片仍可访问（验证 Blobs 持久化）
- [ ] `sitemap.xml`、`robots.txt` 正常
- [ ] 手机端导航抽屉、文章目录可用

---

## 7. 后续：接入 GitHub 自动部署

当前为**手动部署**（每次改代码需执行 `npx netlify deploy --build --prod`）。正式运营建议改为 Git 自动部署：

1. 将项目推送到 GitHub 仓库
2. Netlify → **Project configuration → Build & deploy → Link repository**
3. 选择仓库与主分支
4. 之后每次 `git push` 自动构建部署

构建配置已在 `netlify.toml` 中定义，无需额外设置。

---

## 8. 已知限制

| 限制 | 说明 | 影响 |
|------|------|------|
| **Powered by Netlify 角标** | 免费计划强制显示在页面右下角，付费计划（Pro）才可移除 | 品牌观感 |
| **Functions 冷启动** | 后台首屏与登录约 5~10 秒（免费层） | 后台体验；公开页为静态，不受影响 |
| **Blobs 额度** | 免费层有存储与流量上限，具体数值以 Netlify 当前套餐为准 | 图片量大时需关注 |

---

## 9. 故障排查

| 现象 | 原因 | 处理 |
|------|------|------|
| 全站 401 | 项目 Private / SSO 开启 | 见第 4 节，改为 Public |
| 图片 404 | 上传到了旧路径或存储未识别环境 | 确认 `NETLIFY=true`，重试上传 |
| 后台登录报错 | 数据库不可达（IPv6） | Netlify 侧通常正常；本地跑脚本时加 `--dns-result-order=ipv4first` |
| 页面内容未更新 | revalidate 缓存（60 秒） | 后台保存操作已主动 `revalidatePath`；若仍不更新，等待 60 秒 |
| 构建失败 | 依赖或类型错误 | 本地先跑 `npm run lint && npx tsc --noEmit && npm run build` |

---

## 10. 部署命令速查

```bash
# 本地生产模式验证
npm run build && npm run start

# 部署到 Netlify 生产
npx netlify deploy --build --prod

# 部署预览（不覆盖生产）
npx netlify deploy --build

# 查看站点信息
npx netlify status
```
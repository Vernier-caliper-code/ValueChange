# ValuePass 详细设计

> 状态：**已确认（v1.0）**
> 版本：v1.0　日期：2026-11-05
> 依据：PRD v1.1、概要设计 v1.0、已确认原型 v1
> 说明：本文档定义实现细节，是开发的直接依据；业务代码不在本文档中实现。
>
> 自审说明：v0.2 已修复静态渲染与登录态冲突、Vercel 上传体积限制、数据库连接池、默认封面、阅读时长、精选展示上限、sitemap 静态页、图片域名配置、slug 规则与撤回发布规则等 14 项问题，详见第 18 节「自审记录」。

### 版本记录

| 版本 | 日期 | 状态 | 说明 |
|------|------|------|------|
| v0.1 | 2026-11-05 | 草案 | 详细设计初稿 |
| v0.2 | 2026-11-05 | 自审修订 | 修复 14 项自审问题 |
| v1.0 | 2026-11-05 | 已确认 | 用户审核通过；项目目录结构确认 |

## 1. 设计范围

本文档覆盖：

1. Tailwind 设计系统与统一版心
2. 路由与渲染策略
3. 数据字典（表、字段、索引、约束）
4. 认证、会话、权限与限流
5. Server Actions / Route Handler 契约
6. 页面级规格与组件状态
7. Markdown 渲染与图片上传
8. SEO、统计、错误码
9. 测试设计与性能预算
10. 环境配置与实施顺序

不覆盖：业务背景与需求理由（见 PRD）、总体架构理由（见概要设计）。

## 2. 设计系统（Tailwind CSS）

### 2.1 设计 Token

在 `app/globals.css` 使用 Tailwind v4 `@theme` 定义：

| Token | 值 | 用途 |
|-------|----|------|
| `--color-ink` | `#182336` | 主文字 |
| `--color-muted` | `#687386` | 次要文字 |
| `--color-brand` | `#2b5be4` | 品牌蓝、主按钮 |
| `--color-brand-dark` | `#1d42ae` | 主按钮 hover |
| `--color-paper` | `#fafaf8` | 页面底色 |
| `--color-line` | `#e3e7ed` | 分割线、边框 |
| `--color-soft-blue` | `#edf3ff` | 浅蓝背景 |
| `--color-success` | `#357a55` | 成功 |
| `--color-danger` | `#b44552` | 错误 |
| `--color-warning` | `#9a6a25` | 警告 |
| `--font-sans` | PingFang SC / Microsoft YaHei / Noto Sans CJK SC / sans-serif | 正文 |
| `--font-mono` | SFMono-Regular / Consolas / monospace | 技术标记 |

### 2.2 字号层级

| 场景 | 桌面 | 手机 | 行高 |
|------|------|------|------|
| 首页主标题 | 62px | 37px | 1.3 |
| 页面标题 | 43px | 31px | 1.4 |
| 区块标题 | 30px | 25px | 1.45 |
| 卡片标题 | 20px | 18px | 1.6 |
| 正文 | 15px | 14px | 1.9 |
| 辅助文字 | 12px | 11px | 1.8 |
| 技术标记 | 11px | 10px | 1.5 |

### 2.3 版心（已确认方案 A）

- 区块背景可通栏，内容统一遵守版心
- 版心最大宽度：**1200px**
- 左右留白：桌面 **64px**、平板 **40px**、手机 **24px**
- 区块上下留白：桌面 **80px**、平板 **56px**、手机 **44px**
- 断点：`sm 640`、`md 768`、`lg 1024`、`xl 1280`
- 统一容器组件 `Container`，禁止页面单独写宽度

Tailwind 容器实现约定：

```tsx
<div className="mx-auto w-full max-w-[1200px] px-6 md:px-10 lg:px-16">
  {children}
</div>
```

### 2.4 圆角、阴影、动效

- 圆角：按钮/输入框 6px，卡片 9px，弹窗 12px，图标容器 10~20px
- 阴影：仅用于浮层与弹窗，卡片默认只描边，不用重阴影
- 动效：150~250ms，`ease-out`；`prefers-reduced-motion` 下关闭

### 2.5 基础组件

| 组件 | 变体 |
|------|------|
| Button | primary / secondary / ghost / light / danger；sm / md；loading / disabled |
| Input / Textarea / Select | 默认 / focus / error / disabled |
| FormField | label + control + hint + error |
| Header / Footer | 公共布局，移动端菜单 |
| Breadcrumb | 文章、工具、商品详情 |
| Badge | 板块、状态、演示标记 |
| Modal | 微信咨询、确认删除、重置密码；焦点陷阱 + Esc 关闭 |
| Toast | 成功/失败提示，3.2s 自动消失 |
| EmptyState | 空列表、搜索无结果、已下架商品 |
| MarkdownContent | 文章正文渲染 |
| Skeleton | 列表与后台加载态（最少使用） |

## 3. 路由与渲染策略

| 路由 | 页面 | 权限 | 渲染 | 数据来源 |
|------|------|------|------|----------|
| `/` | 首页 | 公开 | 静态 + revalidate | featured + latest articles |
| `/articles` | AI 全栈列表 | 公开 | 静态 + revalidate | 已发布文章（AI_FULLSTACK） |
| `/articles/[slug]` | 文章详情 | 公开 | 静态 + revalidate | 已发布文章 |
| `/tools` | 工具列表 | 公开 | 静态 + revalidate | 已发布工具 |
| `/tools/[slug]` | 工具详情 | 公开 | 静态 + revalidate | 已发布工具 |
| `/insights` | 经验分享列表 | 公开 | 静态 + revalidate | 已发布文章（PERSPECTIVE） |
| `/insights/[slug]` | 经验详情 | 公开 | 静态 + revalidate | 已发布文章 |
| `/products` | 商品列表 | 公开 | 静态 + revalidate | 上架商品 |
| `/products/[slug]` | 商品详情 | 公开 | 静态 + revalidate | 上架/已下架状态 |
| `/about` | 关于我 | 公开 | 静态 | `lib/site-content.ts` |
| `/login` | 登录 | 公开（已登录跳首页） | 动态 | 账号 |
| `/register` | 注册 | 公开（已登录跳首页） | 动态 | 账号 |
| `/studio` | 后台登录 | 公开页面，仅 ADMIN 可进系统 | 动态 | 账号 |
| `/studio/dashboard` | 后台概览 | ADMIN | 动态 | 计数查询 |
| `/studio/articles` | 文章管理 | ADMIN | 动态 | 全状态文章 |
| `/studio/articles/new` | 新建文章 | ADMIN | 动态 | — |
| `/studio/articles/[id]/edit` | 编辑文章 | ADMIN | 动态 | 指定文章 |
| `/studio/tools` | 工具管理 | ADMIN | 动态 | 全状态工具 |
| `/studio/products` | 商品管理 | ADMIN | 动态 | 全状态商品 |
| `/studio/featured` | 精选管理 | ADMIN | 动态 | 已发布内容 |
| `/studio/users` | 用户管理 | ADMIN | 动态 | 用户列表 |
| `/api/blob-upload` | Blob 客户端直传令牌 | ADMIN | Route Handler | Vercel Blob |
| `/api/auth/me` | 当前登录用户 | 公开 | Route Handler（no-store） | Session |
| `/sitemap.xml` | 站点地图 | 公开 | 动态 | 静态页 + 已发布内容 |
| `/robots.txt` | 爬虫规则 | 公开 | 静态 | — |

**渲染与缓存规则**

- 公开页优先静态生成，`revalidate` 60 秒兜底
- 后台写操作成功后调用 `revalidateTag` / `revalidatePath`
- 草稿、未发布内容不出现在任何公开查询、sitemap
- 已下架商品详情页返回 `noindex`，显示“已下架”并推荐其他商品
- `/studio`、`/login`、`/register` 统一 `noindex`
- 公开页不在服务端读取 Cookie；Header 登录态由客户端组件 `HeaderAuth` 调 `/api/auth/me` 获取，避免公开页全部变为动态渲染

**数据库连接（Vercel Postgres）**

- 使用 Vercel Postgres 的池化连接字符串（pooled connection）
- `postgres` 客户端做成模块级单例，连接上限保持较小（max 1~3），适配 Serverless 实例复用
- 禁止每次请求新建连接池
- 迁移命令使用直连/专用连接串，不经过运行时连接池

## 4. 数据字典

### 4.1 枚举

| 枚举 | 值 |
|------|----|
| `user_role` | `USER` / `ADMIN` |
| `user_status` | `ACTIVE` / `DISABLED` |
| `article_category` | `AI_FULLSTACK` / `PERSPECTIVE` |
| `article_status` | `DRAFT` / `PUBLISHED` |
| `content_status` | `DRAFT` / `PUBLISHED` |
| `product_status` | `ACTIVE` / `OFF_SHELF` |
| `featured_entity_type` | `ARTICLE` / `TOOL` / `PRODUCT` |

### 4.2 users

| 字段 | 类型 | 约束 |
|------|------|------|
| `id` | uuid | PK，`gen_random_uuid()` |
| `username` | varchar(32) | NOT NULL，UNIQUE，3~32 位 |
| `password_hash` | text | NOT NULL |
| `role` | user_role | NOT NULL，默认 USER |
| `status` | user_status | NOT NULL，默认 ACTIVE |
| `created_at` | timestamptz | NOT NULL，默认 now() |
| `updated_at` | timestamptz | NOT NULL，默认 now() |

索引：`username` 唯一索引；`role` + `status` 普通索引（后台筛选）。
约定：用户名统一转小写存储；仅允许 `[a-z0-9_]`。

### 4.3 sessions

| 字段 | 类型 | 约束 |
|------|------|------|
| `id` | uuid | PK |
| `user_id` | uuid | NOT NULL，FK users(id) ON DELETE CASCADE |
| `token_hash` | char(64) | NOT NULL，UNIQUE（SHA-256 hex） |
| `expires_at` | timestamptz | NOT NULL |
| `created_at` | timestamptz | NOT NULL，默认 now() |

索引：`user_id`；`expires_at`（清理过期会话）。

### 4.4 auth_attempts

| 字段 | 类型 | 约束 |
|------|------|------|
| `key` | varchar(255) | PK（`login:用户名:IP`） |
| `failed_count` | smallint | NOT NULL，默认 0 |
| `locked_until` | timestamptz | NULL |
| `updated_at` | timestamptz | NOT NULL，默认 now() |

清理策略：登录时顺带删除 `updated_at < now() - 24h` 的记录。

### 4.5 articles

| 字段 | 类型 | 约束 |
|------|------|------|
| `id` | uuid | PK |
| `author_id` | uuid | NOT NULL，FK users(id) ON DELETE RESTRICT |
| `title` | varchar(120) | NOT NULL |
| `slug` | varchar(160) | NOT NULL，UNIQUE |
| `content_md` | text | NOT NULL |
| `excerpt` | varchar(300) | NULL（留空自动生成 150 字） |
| `cover_url` | text | NULL |
| `category` | article_category | NOT NULL |
| `status` | article_status | NOT NULL，默认 DRAFT |
| `published_at` | timestamptz | NULL（发布时写入） |
| `created_at` | timestamptz | NOT NULL，默认 now() |
| `updated_at` | timestamptz | NOT NULL，默认 now() |

索引：`slug` 唯一；`(category, status, published_at DESC)`。
约束：slug 只允许小写字母、数字与连字符；正文以 H2/H3 为主，不使用 H1。

### 4.6 tools

| 字段 | 类型 | 约束 |
|------|------|------|
| `id` | uuid | PK |
| `author_id` | uuid | NOT NULL，FK users(id) |
| `name` | varchar(80) | NOT NULL |
| `slug` | varchar(160) | NOT NULL，UNIQUE |
| `summary` | varchar(160) | NOT NULL |
| `description` | text | NOT NULL |
| `image_url` | text | NOT NULL |
| `website_url` | text | NOT NULL（仅 http/https） |
| `status` | content_status | NOT NULL，默认 DRAFT |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

索引：`slug` 唯一；`(status, created_at DESC)`。

### 4.7 products

| 字段 | 类型 | 约束 |
|------|------|------|
| `id` | uuid | PK |
| `author_id` | uuid | NOT NULL，FK users(id) |
| `name` | varchar(120) | NOT NULL |
| `slug` | varchar(160) | NOT NULL，UNIQUE |
| `description` | text | NOT NULL |
| `status` | product_status | NOT NULL，默认 ACTIVE |
| `created_at` | timestamptz | NOT NULL |
| `updated_at` | timestamptz | NOT NULL |

索引：`slug` 唯一；`(status, created_at DESC)`。

### 4.8 product_images

| 字段 | 类型 | 约束 |
|------|------|------|
| `id` | uuid | PK |
| `product_id` | uuid | NOT NULL，FK products(id) ON DELETE CASCADE |
| `url` | text | NOT NULL |
| `alt` | varchar(160) | NULL |
| `sort_order` | integer | NOT NULL，默认 0 |
| `created_at` | timestamptz | NOT NULL |

索引：`(product_id, sort_order)`。

### 4.9 featured_items

| 字段 | 类型 | 约束 |
|------|------|------|
| `id` | uuid | PK |
| `entity_type` | featured_entity_type | NOT NULL |
| `entity_id` | uuid | NOT NULL |
| `sort_order` | integer | NOT NULL，默认 0 |
| `created_at` | timestamptz | NOT NULL |

约束：`UNIQUE(entity_type, entity_id)`；索引 `(entity_type, sort_order)`。
说明：跨表无外键，由 Server Action 校验实体存在且已发布/上架；删除实体时在同一事务中清理精选记录。

## 5. 认证与会话详细设计

### 5.1 注册

- 输入：`username`、`password`、`confirmPassword`
- 校验：用户名 3~32 位，`[a-zA-Z0-9_]`，统一转小写；密码 8~72 位；两次一致
- 用户名唯一冲突返回 `AUTH_USERNAME_TAKEN`
- 密码使用 bcryptjs，cost 12
- 注册成功创建 Session，自动登录，`redirectTo` 仅允许站内路径

### 5.2 登录

- 先查账号；不存在与密码错误统一返回“账号或密码错误”
- `status=DISABLED` 返回 `AUTH_DISABLED`
- 连续失败 5 次锁定 15 分钟，返回 `AUTH_LOCKED`
- 成功：清零失败计数、创建新 Session、轮换 Cookie
- 管理员登录 `/studio` 时额外校验 `role=ADMIN`，非管理员按无效凭据处理

### 5.3 会话

- Cookie 名：`vp_session`
- 原始 Token：32 字节随机数（base64url）
- 数据库只存 SHA-256 哈希
- Cookie：httpOnly、Secure（生产）、SameSite=Lax、Path=/、7 天
- 退出登录：删除当前 Session + 清 Cookie
- 禁用账号/重置密码：删除该用户全部 Session
- 每次请求过期 Session 视为未登录

### 5.4 管理员种子脚本

- 命令：`npm run db:seed:admin`
- 读取 `ADMIN_USERNAME`、`ADMIN_PASSWORD`
- 校验账号与密码强度；已存在同名用户时仅允许更新密码（需显式 `--force`）
- 已存在同名普通用户时中止，避免误提权
- 不把明文密码写入任何文件或日志

### 5.5 限流

- key：`login:${username.toLowerCase()}:${ip}`
- 失败一次计数 +1；达到 5 次写入 `locked_until = now()+15min`
- 锁定期间直接拒绝，错误信息统一
- 登录成功删除该 key
- IP 从 `x-forwarded-for` 首段取，缺失时用 `unknown`

### 5.6 权限

- `getCurrentUser()`：读取 Cookie → 查 Session → 返回用户或 null
- `requireUser()`：未登录返回 `UNAUTHORIZED`
- `requireAdmin()`：非 ADMIN 返回 `FORBIDDEN`
- Studio 布局层做一次校验；每个 Server Action 内再次校验（防御纵深）
- 普通用户不可禁用自己；管理员不可禁用/降权自己

## 6. Server Actions 与接口契约

### 6.1 认证

| 名称 | 输入 | 成功 | 失败码 |
|------|------|------|--------|
| `registerAction` | username, password, confirmPassword | `{ok:true}` + 设 Cookie | VALIDATION_ERROR / AUTH_USERNAME_TAKEN |
| `loginAction` | username, password, redirectTo? | `{ok:true}` + 设 Cookie | AUTH_INVALID_CREDENTIALS / AUTH_LOCKED / AUTH_DISABLED |
| `logoutAction` | — | `{ok:true}` + 清 Cookie | — |

### 6.2 文章

| 名称 | 输入 | 说明 |
|------|------|------|
| `createArticleAction` | title, slug?, contentMd, excerpt?, coverUrl?, category, intent | intent=draft/publish；发布时写 published_at |
| `updateArticleAction` | id + 同上 | 修改后刷新缓存 |
| `setArticleStatusAction` | id, status | 发布/撤回 |
| `deleteArticleAction` | id | 事务内清理 featured_items |

### 6.3 工具

| 名称 | 输入 |
|------|------|
| `createToolAction` | name, slug?, summary, description, imageUrl, websiteUrl, intent |
| `updateToolAction` | id + 同上 |
| `setToolStatusAction` | id, status |
| `deleteToolAction` | id（同时清理精选） |

### 6.4 商品

| 名称 | 输入 |
|------|------|
| `createProductAction` | name, slug?, description, images: {url, alt?, sortOrder}[], intent |
| `updateProductAction` | id + 同上 |
| `setProductStatusAction` | id, status |
| `deleteProductAction` | id（级联删除图片 + 清理精选） |

### 6.5 精选与用户

| 名称 | 输入 | 说明 |
|------|------|------|
| `setFeaturedAction` | entityType, entityId, featured | 校验实体已发布/上架 |
| `moveFeaturedAction` | id, direction | 上移/下移排序 |
| `listUsersAction` | query?, status? | 后台用户列表 |
| `setUserStatusAction` | userId, status | 不允许操作自己 |
| `resetUserPasswordAction` | userId, newPassword | 校验强度，删除该用户全部 Session |

### 6.6 图片上传（Vercel Blob 客户端直传）

Vercel Functions 请求体上限约 4.5MB，低于 PRD 的 5MB 图片上限，因此**不通过 Server Action 或普通 Route Handler 传文件**，采用 Vercel Blob 客户端直传：

1. 浏览器调用 `upload()`（`@vercel/blob/client`）
2. 请求 `/api/blob-upload` 生成上传令牌
3. 令牌接口校验：ADMIN Session、`kind`、`contentType`、`size ≤ 5MB`
4. 浏览器直传 Vercel Blob，服务端不接收文件字节
5. 返回公开 URL，表单保存该 URL

`POST /api/blob-upload` 契约：

- 鉴权：ADMIN Session
- 请求：由 `handleUpload` 约定，包含 `pathname`、`contentType`、`size`、`kind`
- 允许类型：`image/jpeg`、`image/png`、`image/webp`
- 允许大小：≤ 5MB
- 路径：`valuepass/{kind}/{yyyy}/{random}.{ext}`
- 失败：`UNAUTHORIZED`、`UPLOAD_TOO_LARGE`、`UPLOAD_TYPE_INVALID`
- 令牌生成与上传回调均校验管理员身份

> 备选：若后续把上限降到 4MB，可改回普通 Route Handler；v1 按 5MB 需求使用直传。

### 6.7 公开数据函数

`lib/data/*` 中提供：

- `getHomeData()`
- `getArticles(category)`
- `getArticleBySlug(slug)`
- `getTools()` / `getToolBySlug(slug)`
- `getProducts()` / `getProductBySlug(slug)`
- `getSitemapEntries()`

只返回符合公开状态的数据；所有查询使用 Drizzle 参数化。

### 6.8 错误返回约定

Server Action 统一返回：

```ts
type ActionResult<T = undefined> =
  | { ok: true; data?: T }
  | { ok: false; code: ErrorCode; message: string; fieldErrors?: Record<string, string> };
```

Route Handler 使用标准 HTTP 状态码 + `{ error: { code, message } }`。

### 6.9 `/api/auth/me`

- 方法：GET
- 目的：供 `HeaderAuth` 客户端组件读取当前登录用户
- 返回：`{ user: { id, username } | null }`
- `Cache-Control: no-store`
- 未登录返回 `{ user: null }`，不抛 401，避免控制台噪音

## 7. 页面级详细规格

### 7.1 全局布局

- Header：92px（桌面）/ 76px（手机）
- Logo 37px（桌面）/ 34px（手机），链接首页
- 导航：首页 / AI全栈 / AI工具 / 经验分享 / 商品 / 关于我
- 右侧：未登录显示“登录 / 注册”；已登录显示用户名 + 退出
- 已登录状态由客户端组件 `HeaderAuth` 调用 `/api/auth/me` 获取；服务端不读取 Cookie，保证公开页可静态化
- 首屏先渲染“登录 / 注册”占位，读取完成后按需切换；预留固定宽度避免布局跳动
- 移动端：汉堡菜单，展开下拉导航；Esc 关闭；焦点管理
- Footer：品牌、三个快捷链接、版权、`LESS HYPE. MORE BUILDING.`

### 7.2 首页

模块顺序：

1. Hero：标题 + 简介 + 两个 CTA + 架构插图 + 底部说明条
2. 四板块入口：AI 全栈 / AI 工具 / 经验分享 / 我的商品（编号 01~04）
3. 精选内容：1 大 + 3 小；后台手动精选；首页最多展示排序前 4 条；无精选时展示最新 4 篇文章
4. 深色工具区：通栏背景，内容遵守版心；三条工具入口
5. 商品高亮区：商品封面 + 文案 + “看看我的商品”
6. 品牌格言区
7. Footer

SEO：`ValuePass｜让想法，长成有价值的产品`
状态：精选为空 → 最新 4 篇；数据库异常 → 错误边界（500）。

### 7.3 文章列表（AI 全栈 / 经验分享）

- 页面 intro：eyebrow、H1、说明、数量/提示
- 列表行：封面 220px + 标题/摘要/元信息 + 箭头
- 桌面三列行布局；手机图片在上、文字在下
- 空状态：`内容筹备中` + 返回首页按钮
- 无分页（v1）；超过 50 条时后续迭代加载更多
- 点击整行进详情

### 7.4 文章详情

- 面包屑：首页 / 板块 / 文章
- 标题（H1）、摘要、发布时间、阅读时长
- 阅读时长 = `max(1, ceil(去除 Markdown 标记后的正文字符数 / 400))` 分钟
- 发布时间统一按 Asia/Shanghai 显示为 `YYYY.MM.DD`；数据库存 UTC
- 封面为空时使用默认封面 `/images/default-article-cover.svg`（开发时创建）
- 正文最大宽度 760px，行高 2.1
- 桌面右侧目录（H2/H3），滚动高亮
- 正文支持：段落、H2/H3、列表、引用、代码块、行内代码、链接、分隔线
- 禁止：原始 HTML、H1、脚本、iframe
- 文末：返回列表 + 下一篇引导
- 草稿/不存在：404
- SEO：title = 文章标题｜ValuePass；description = 摘要；OG 图 = 封面/默认图；Article JSON-LD

### 7.5 工具列表

- 三列（桌面）/ 两列（平板）/ 单列（手机）
- 卡片：插画/图片、名称、功能摘要、“看看我的使用方式”
- 暂无工具：空状态
- 点击图片或卡片进详情

### 7.6 工具详情

- 头部：图标/图片 + 名称 + 功能摘要
- 正文：介绍 + 使用建议（Markdown 或纯文本）
- 侧栏：前往官网按钮（新窗口，`rel=noopener noreferrer`）
- 点击官网按钮触发百度统计事件
- 草稿：404

### 7.7 商品列表

- 三列 / 两列 / 单列
- 卡片：图片、名称、描述、“了解更多”
- 底部说明：仅展示，不提供在线支付
- 空状态

### 7.8 商品详情

- 商品图片 1~8 张，第一张为主图；无图片时禁止保存
- 左：主图 + 缩略图切换
- 右：名称、描述、特点列表、`微信咨询这件作品` 按钮
- 点击按钮打开微信二维码弹窗：
  - 显示真实二维码 `/contact/wechat-qr.png`
  - 显示微信号 `dxl20061110`
  - 复制微信号按钮
  - 点击遮罩/关闭/Esc 关闭
  - 打开时触发百度统计事件
- 已下架：显示“该商品已下架” + 其他商品推荐；`noindex`
- SEO：title、description、OG 图

### 7.9 关于我

- H1 品牌宣言
- “为什么叫 ValuePass” + “我坚持的几件事”
- 联系方式区：微信号 `dxl20061110`、真实二维码、复制按钮
- 内容由 `lib/site-content.ts` 维护（v1 不做后台编辑）

### 7.10 登录 / 注册

- 两个独立页面，共享表单组件
- 登录：账号、密码、登录按钮、注册链接、“忘记密码请联系站长”
- 注册：账号、密码、确认密码、注册按钮、登录链接
- 已登录访问 `/login`、`/register` → 跳首页
- 校验错误字段级展示；服务端错误统一提示
- 成功后：登录跳 `redirectTo` 或首页；注册自动登录并跳首页
- 提交中禁用按钮并显示 loading

### 7.11 Studio 后台

**登录页 `/studio`**

- 账号 + 密码；仅 ADMIN 可进入
- 错误统一提示；登录成功进 `/studio/dashboard`
- 页面 `noindex`

**布局**

- 左侧固定侧栏（桌面）：Logo、文章/工具/商品/精选/用户、查看前台、退出
- 手机：顶部横向导航
- 内容区浅灰底

**Dashboard**

- 4 个计数：文章总数、已发布、草稿、精选
- 快捷入口：写文章、管理工具、管理商品
- 不展示百度统计图表（沿用 PRD）

**文章管理**

- 表格列：标题、板块、更新时间、状态、操作
- 筛选：全部 / 已发布 / 草稿
- 操作：编辑、预览、发布/撤回、删除（确认弹窗）
- 新建/编辑页：
  - 标题、板块、摘要、封面、正文（Markdown）
  - 左编辑右实时预览
  - 保存草稿 / 发布
  - 封面 ≤5MB；上传失败保留表单
  - 离开页面未保存时提示（P1，可后补）

**工具管理**

- 列表 + 新建/编辑表单：图片、名称、功能摘要、介绍、官网链接、状态
- 图片上传复用上传接口
- 官网链接校验 http/https

**商品管理**

- 列表 + 新建/编辑：名称、描述、多图（上传/删除/排序）、上架/下架
- 无价格字段
- 删除需确认

**精选管理**

- 列出已发布文章、工具、上架商品
- 勾选加入/移出精选；上移/下移排序
- 保存后刷新首页缓存

**用户管理**

- 列表：账号、注册时间、状态、操作
- 禁用/启用（不可操作自己）
- 重置密码弹窗：输入新密码 + 确认；提交后强制该用户下线

## 8. 组件与状态规格

### 8.1 按钮

- 高度：md 48px，sm 38px
- 主按钮：品牌蓝底白字，hover 深蓝
- 次按钮：白底描边，hover 深色描边
- loading：禁用点击 + spinner；文本保留
- 所有图标按钮必须有 `aria-label`

### 8.2 表单

- label 在上，必填标 `*`
- 错误：输入框红边 + 下方错误文字，`role=alert`
- 服务端字段错误映射到对应字段
- 输入框聚焦有可见 focus ring

### 8.3 模态框

- 打开：记录触发元素，焦点移到关闭按钮
- Tab 焦点循环；Esc 关闭；点击遮罩关闭
- 关闭后焦点回到触发元素
- 背景滚动锁定

### 8.4 空状态

- 无内容：标题 + 说明 + 次要 CTA
- 图文简洁，不使用插画堆砌
- 404：404 数字 + 回首页按钮

### 8.5 加载与错误

- 列表页使用轻量 Skeleton（仅客户端取数时）
- 服务端错误：错误边界 + 重试按钮
- 网络失败：Toast + 保留用户输入
- 会话过期：跳登录并带 `redirectTo`

## 9. Markdown 与图片上传

### 9.1 Markdown

- 存储原始 Markdown（`content_md`）
- 服务端渲染：`react-markdown` + `remark-gfm` + `rehype-sanitize` + `rehype-highlight`
- 处理顺序：先 `rehype-sanitize` 清洗，再 `rehype-highlight` 高亮；sanitize schema 需允许代码高亮所需的 `className`，否则高亮样式会被清除
- 禁用原始 HTML
- 允许标签：h2、h3、p、ul、ol、li、blockquote、pre、code、a、strong、em、hr、img（仅 https）
- 外部链接统一 `target=_blank` + `rel=noopener noreferrer`
- 代码块支持常用语言高亮
- 正文 H1 不使用，页面标题单独渲染

### 9.2 上传

- 仅管理端可用
- 采用 Vercel Blob 客户端直传（见 6.6），避免 Vercel Functions 4.5MB 请求体限制
- 支持 jpeg / png / webp
- 最大 5MB
- 令牌接口校验 MIME、大小与管理员身份
- 随机文件名，不信任原始文件名
- 上传成功返回 Blob URL
- 替换图片不自动删除旧 Blob（v1 保留，后续做清理任务）
- 失败提示明确原因并保留表单

## 10. SEO 与统计

### 10.1 SEO

- title 模板：`%s｜ValuePass`
- 每页独立 description
- canonical 基于 `NEXT_PUBLIC_SITE_URL`
- OG 图：封面或默认品牌图
- sitemap：包含静态页（/、/articles、/tools、/insights、/products、/about）+ 已发布文章、工具、上架商品
- 图片使用 `next/image`，在 `next.config.ts` 配置 Vercel Blob 远程域名白名单（`*.public.blob.vercel-storage.com`）
- 默认 OG 图：`/images/og-default.png`（开发时创建）
- robots 屏蔽 `/studio`、`/api`、`/login`、`/register`
- 文章详情输出 Article JSON-LD
- 404 返回真实 404 状态

### 10.2 百度统计

- 仅生产环境加载
- 事件统一封装：

```ts
trackEvent('Product', 'open_wechat_qr', slug)
trackEvent('Tool', 'visit_website', slug)
```

- 页面 PV/UV 由百度统计自动采集
- 不做后台自建报表

## 11. 错误码与异常处理

| 错误码 | HTTP | 用户提示 |
|--------|------|----------|
| VALIDATION_ERROR | 400 | 请检查填写内容 |
| AUTH_INVALID_CREDENTIALS | 401 | 账号或密码错误 |
| AUTH_LOCKED | 429 | 尝试次数过多，请 15 分钟后再试 |
| AUTH_USERNAME_TAKEN | 409 | 该用户名已被使用 |
| AUTH_DISABLED | 403 | 该账号已被禁用，请联系站长 |
| UNAUTHORIZED | 401 | 请先登录 |
| FORBIDDEN | 403 | 无权执行该操作 |
| UPLOAD_TOO_LARGE | 413 | 图片不能超过 5MB |
| UPLOAD_TYPE_INVALID | 415 | 仅支持 JPG/PNG/WebP |
| NOT_FOUND | 404 | 内容不存在或已下架 |
| INTERNAL_ERROR | 500 | 服务暂时不可用，请稍后重试 |

前端不展示堆栈、数据库错误原文或内部路径。

## 12. 测试设计

### 12.1 单元测试（Vitest）

- 用户名/密码校验
- slug 生成与校验
- 摘要自动截取
- 权限判断
- 错误码映射
- Markdown 清洗规则

### 12.2 E2E（Playwright）

| PRD 验收项 | 测试 |
|------------|------|
| 1 发布文章可见 | studio 登录 → 新建文章 → 发布 → 前台列表/详情可见 |
| 2 首页精选 | 勾选精选 → 首页出现；取消 → 消失 |
| 3 工具详情 | 工具列表 → 详情 → 官网按钮新窗口 |
| 4 商品咨询 | 商品详情 → 打开二维码弹窗 → 展示微信号 dxl20061110 |
| 5 已下架商品 | 下架后访问详情 → 显示已下架 + 推荐 |
| 6 注册冲突 | 重复用户名 → 明确提示 |
| 7 登录锁定 | 连续 5 次失败 → 锁定 15 分钟提示 |
| 8 后台权限 | 未登录/普通用户访问 /studio → 拒绝 |
| 9 404/空状态 | 不存在 URL、空板块 → 对应页面 |
| 10 响应式 | 1440/390/320 无水平溢出，关键页面布局正常 |

### 12.3 视觉回归

- 首页、文章详情、工具详情、商品详情、关于页
- 桌面 1440 与手机 390 截图对比原型
- 首屏 LCP 用 Lighthouse 检查

## 13. 性能预算

| 指标 | 目标 |
|------|------|
| LCP | < 2.0s |
| CLS | < 0.1 |
| INP | < 200ms |
| 首屏 JS（gzip） | 目标 < 200KB |
| 图片 | WebP/AVIF，懒加载，封面宽度 ≤1600px |
| 字体 | 系统字体，不加载 Web Font |
| 缓存 | 公开页静态 + 按需 revalidate |

## 14. 配置与命令

### 14.1 环境变量

```
DATABASE_URL=
BLOB_READ_WRITE_TOKEN=
SESSION_SECRET=
NEXT_PUBLIC_SITE_URL=
BAIDU_ANALYTICS_ID=
ADMIN_USERNAME=
ADMIN_PASSWORD=
```

`.env.example` 只写 key，不写真实值；`.env*` 不提交。

### 14.2 命令

```bash
npm run dev            # 本地开发
npm run build          # 生产构建
npm run lint           # ESLint
npm run test           # Vitest
npm run test:e2e       # Playwright
npm run db:generate    # 生成迁移
npm run db:migrate     # 执行迁移
npm run db:seed:admin  # 创建管理员
```

## 15. 实施顺序

1. 工程初始化：Next.js + TypeScript + Tailwind + 设计 Token + Container
2. 数据库 Schema、迁移、种子管理员
3. 认证：注册/登录/退出/限流/禁用
4. 公共布局 + 首页 + 六个前台页面
5. 后台：文章/工具/商品 CRUD、Markdown 编辑器、图片上传
6. 精选管理、用户管理、缓存刷新
7. SEO、百度统计、错误页、空状态
8. E2E/单元测试、Lighthouse、Vercel 部署
9. 内容填充与软上线

## 16. 假设与已确认事项

1. 关于页内容 v1 写在 `lib/site-content.ts`，不做后台编辑（PRD 未要求）。
2. 列表 v1 不做分页（内容量小）；超过 50 条再迭代。
3. 工具状态采用 DRAFT / PUBLISHED（PRD 未明确，按文章一致处理）。
4. 商品图片顺序通过 `sort_order` 控制，后台支持上移/下移。
5. 管理员只有一个，通过种子脚本创建。
6. 微信号 `dxl20061110`、二维码 `brand/contact/wechat-qr.png` 已提供；开发时复制到 `public/contact/wechat-qr.png`。
7. slug 留空时自动生成 `article-{8位随机串}` / `tool-{8位随机串}` / `product-{8位随机串}`；手动填写必须是 `[a-z0-9-]`，重复则提示修改。
8. 文章“撤回发布”只改状态为 DRAFT，保留原 `published_at`；重新发布不覆盖原发布时间。
9. 站内搜索为 P1，v1 不实现、不预留路由。
10. 工具状态采用 DRAFT / PUBLISHED；商品状态采用 ACTIVE / OFF_SHELF。

## 17. 审核清单（已通过）

- [x] 数据字典字段齐全、命名合理
- [x] 登录/限流/禁用/重置密码规则符合预期
- [x] Server Actions 划分合理
- [x] 页面级规格无遗漏模块或状态
- [x] Tailwind Token 与版心数值认可
- [x] SEO、统计、错误码覆盖 PRD
- [x] 测试映射完整
- [x] 实施顺序认可


## 18. 自审记录（v0.2）

| # | 自审发现 | 级别 | 处理 |
|---|----------|------|------|
| 1 | 公开页若由 Server Component 读取 Cookie 判断登录态，会导致所有页面变为动态渲染，与“静态生成 + revalidate”冲突 | P1 | 增加 `HeaderAuth` 客户端组件 + `/api/auth/me`，公开页不读 Cookie |
| 2 | Vercel Functions 请求体上限约 4.5MB，普通上传接口无法承接 5MB 图片 | P1 | 改为 Vercel Blob 客户端直传 + `/api/blob-upload` 令牌接口 |
| 3 | Vercel Postgres 在 Serverless 下需要池化连接，避免连接耗尽 | P1 | 明确使用池化连接串 + 模块级单例 + max 1~3 |
| 4 | 文章封面为空时没有默认图规则 | P2 | 增加默认封面 `/images/default-article-cover.svg` |
| 5 | 页面显示“阅读时长”但未定义计算方式 | P2 | 明确按 400 字/分钟计算，最少 1 分钟 |
| 6 | 首页精选展示数量未与 1 大 + 3 小布局对齐 | P2 | 明确最多展示排序前 4 条；无精选展示最新 4 篇 |
| 7 | 商品图片数量与主图规则未定义 | P2 | 明确 1~8 张，第一张为主图，无图禁止保存 |
| 8 | sitemap 未包含静态列表页 | P2 | 补充 6 个静态页面 + 动态详情页 |
| 9 | `next/image` 未配置 Vercel Blob 远程域名 | P2 | 增加 remotePatterns 白名单 |
| 10 | Markdown 清洗与代码高亮的顺序未明确 | P2 | 明确 sanitize 后高亮或配置 schema 允许 className，禁止原始 HTML |
| 11 | slug 自动生成与重复处理未定义 | P2 | 增加 8 位随机后缀规则与手动 slug 校验 |
| 12 | 撤回发布后 `published_at` 的处理未定义 | P2 | 撤回保留原发布时间，重新发布不覆盖 |
| 13 | 项目缺少站内搜索的显式范围说明 | P3 | 在假设中写明搜索为 P1，v1 不实现 |
| 14 | 缺少日期时区显示约定 | P3 | 明确数据库 UTC、展示 Asia/Shanghai `YYYY.MM.DD` |

**自审结论**：修订后文档与 PRD、概要设计一致；未发现需求遗漏。文档已由用户审核通过，以下假设一并确认：

- 关于页内容 v1 写在 `lib/site-content.ts`，不做后台编辑
- 工具状态采用 DRAFT / PUBLISHED
- 列表 v1 不分页，超过 50 条再迭代


## 19. 项目目录结构（已确认）

正式项目采用 Next.js App Router，生产代码放在 `src/`；`prototype/`、`docs/`、`brand/` 与正式代码隔离。

```text
ValueChange/
├─ .git/
├─ .gitignore
├─ AGENTS.md
├─ README.md
├─ package.json
├─ package-lock.json
├─ tsconfig.json
├─ next.config.ts
├─ postcss.config.mjs
├─ eslint.config.mjs
├─ drizzle.config.ts
├─ playwright.config.ts
├─ vitest.config.ts
├─ .env.example
│
├─ src/
│  ├─ app/
│  │  ├─ layout.tsx                 # 根布局：html/body、全局样式、统计
│  │  ├─ globals.css                # Tailwind + 设计 Token
│  │  ├─ favicon.ico
│  │  ├─ error.tsx                  # 全局错误边界
│  │  ├─ global-error.tsx
│  │  ├─ not-found.tsx              # 404
│  │  ├─ sitemap.ts
│  │  ├─ robots.ts
│  │  │
│  │  ├─ (site)/                    # 公开前台（URL 不带 /(site)）
│  │  │  ├─ layout.tsx              # Header + Footer
│  │  │  ├─ page.tsx                # /
│  │  │  ├─ articles/
│  │  │  │  ├─ page.tsx             # /articles
│  │  │  │  └─ [slug]/page.tsx      # /articles/[slug]
│  │  │  ├─ tools/
│  │  │  │  ├─ page.tsx             # /tools
│  │  │  │  └─ [slug]/page.tsx      # /tools/[slug]
│  │  │  ├─ insights/
│  │  │  │  ├─ page.tsx             # /insights
│  │  │  │  └─ [slug]/page.tsx      # /insights/[slug]
│  │  │  ├─ products/
│  │  │  │  ├─ page.tsx             # /products
│  │  │  │  └─ [slug]/page.tsx      # /products/[slug]
│  │  │  └─ about/page.tsx          # /about
│  │  │
│  │  ├─ (auth)/                    # 登录注册（独立简洁布局）
│  │  │  ├─ layout.tsx
│  │  │  ├─ login/page.tsx          # /login
│  │  │  └─ register/page.tsx       # /register
│  │  │
│  │  ├─ studio/                    # 后台
│  │  │  ├─ layout.tsx              # 后台基础布局 + noindex
│  │  │  ├─ page.tsx                # /studio 管理员登录
│  │  │  └─ (panel)/                # 登录后的管理区
│  │  │     ├─ layout.tsx           # 侧栏 + 管理员鉴权
│  │  │     ├─ dashboard/page.tsx
│  │  │     ├─ articles/
│  │  │     │  ├─ page.tsx
│  │  │     │  ├─ new/page.tsx
│  │  │     │  └─ [id]/edit/page.tsx
│  │  │     ├─ tools/
│  │  │     │  ├─ page.tsx
│  │  │     │  ├─ new/page.tsx
│  │  │     │  └─ [id]/edit/page.tsx
│  │  │     ├─ products/
│  │  │     │  ├─ page.tsx
│  │  │     │  ├─ new/page.tsx
│  │  │     │  └─ [id]/edit/page.tsx
│  │  │     ├─ featured/page.tsx
│  │  │     └─ users/page.tsx
│  │  │
│  │  └─ api/
│  │     ├─ auth/me/route.ts        # HeaderAuth 获取登录态
│  │     └─ blob-upload/route.ts    # Vercel Blob 直传令牌
│  │
│  ├─ components/
│  │  ├─ ui/                        # Button、Input、Modal、Toast、Container 等
│  │  ├─ layout/                    # Header、Footer、HeaderAuth、MobileNav、StudioSidebar
│  │  ├─ content/                   # Article、Tool、Product、WechatDialog
│  │  ├─ forms/                     # 登录、注册、文章、工具、商品表单
│  │  └─ seo/                       # JSON-LD
│  │
│  ├─ lib/
│  │  ├─ db/                        # Drizzle 连接单例与 Schema
│  │  ├─ auth/                      # 密码、会话、鉴权、限流
│  │  ├─ actions/                   # Server Actions
│  │  ├─ data/                      # 公开数据查询
│  │  ├─ validation/                # Zod Schema
│  │  ├─ upload/                    # Vercel Blob 上传
│  │  ├─ utils/                     # slug、摘要、阅读时长、日期、结果
│  │  ├─ analytics.ts
│  │  ├─ seo.ts
│  │  └─ site-content.ts            # 关于页静态内容
│  │
│  └─ types/                        # 共享类型
│
├─ public/                          # 运行时公开资源
│  ├─ brand/icon.png
│  ├─ contact/wechat-qr.png
│  └─ images/
│     ├─ architecture.svg
│     ├─ default-article-cover.svg
│     └─ og-default.png
│
├─ drizzle/                         # Drizzle 迁移
│  ├─ 0000_init.sql
│  └─ meta/
│
├─ scripts/
│  └─ seed-admin.ts                 # 一次性创建管理员
│
├─ tests/
│  ├─ e2e/                          # Playwright
│  ├─ unit/                         # Vitest
│  └─ fixtures/
│
├─ docs/
│  ├─ prd.md
│  ├─ high-level-design.md
│  └─ detailed-design.md
│
├─ brand/                           # 原始设计素材，不直接对外服务
│  ├─ icons/
│  └─ contact/
│
└─ prototype/                       # 高保真原型，不参与正式构建
```

### 19.1 目录职责

| 目录 | 职责 |
|------|------|
| `src/app` | 所有路由与页面，App Router 组织 |
| `src/components` | 可复用组件，按 UI / 布局 / 内容 / 表单分组 |
| `src/lib` | 数据、鉴权、Server Actions、校验、工具函数 |
| `public` | 浏览器可直接访问的图片与资源 |
| `brand` | 原始设计素材，不直接对外服务 |
| `drizzle` | 数据库迁移文件 |
| `scripts` | 一次性运维脚本，如创建管理员 |
| `tests` | 正式项目的单元测试与 E2E |
| `docs` | 产品文档与设计文档 |
| `prototype` | 原型，不参与正式构建 |

### 19.2 目录约束

1. 正式业务代码只写在 `src/`、`public/`、`drizzle/`、`scripts/`、`tests/` 等生产目录。
2. `prototype/` 是冻结的设计参考，正式代码禁止 import 原型文件，也不得在原型目录中继续写业务功能。
3. `brand/` 保存源素材；需要对外访问的图片复制到 `public/`。
4. 路由组 `(site)`、`(auth)`、`(panel)` 不改变 URL，只用于布局隔离。
5. `/studio` 登录页独立；登录后 `(panel)` 才加载后台侧栏与管理员鉴权。
6. 公开页不在服务端读取 Cookie；登录态统一由 `HeaderAuth` 调 `/api/auth/me`。
7. 图片上传只保留 `/api/blob-upload`，不新增普通文件上传接口。
8. 重要架构或接口变更，先更新 `docs/` 文档，再改代码。

## 20. 文档与代码边界

| 类型 | 位置 | 说明 |
|------|------|------|
| 需求 | `docs/prd.md` | 产品目标、范围、验收标准 |
| 概要设计 | `docs/high-level-design.md` | 架构、技术选型、模块划分 |
| 详细设计 | `docs/detailed-design.md` | 数据字典、接口、页面规格、目录结构 |
| 测试计划 | `docs/test-plan.md` | 测试策略、范围、环境、验收映射 |
| 测试报告 | `docs/test-report.md` | 上线前生成；记录执行结果与缺陷 |
| 原型 | `prototype/` | 视觉与交互参考，不参与构建 |
| 原型说明 | `prototype/README.md` | 原型启动与测试说明 |
| 正式代码 | `src/` | Next.js 生产代码 |
| 品牌素材 | `brand/` | Logo、favicon、微信二维码源文件 |
| 运行时资源 | `public/` | 网站实际对外提供的图片与静态资源 |
| 数据库迁移 | `drizzle/` | 结构化迁移与元数据 |
| 运维脚本 | `scripts/` | 管理员种子等一次性脚本 |
| 测试 | `tests/` | 单元测试与 E2E |

## 21. 确认结论

- 详细设计已于 2026-11-05 审核通过（v1.0）
- 项目目录结构已确认
- 开发可以在新会话中直接依据本文档开始
- 开发前必须先阅读 `docs/prd.md`、`docs/high-level-design.md`、`docs/detailed-design.md`、`docs/test-plan.md` 与 `AGENTS.md`

# ValuePass 测试计划

> 状态：已细化（全部用例编号、前置条件、步骤、预期结果、自动化落地）
> 版本：v1.0　日期：2026-11-05
> 依据：`docs/prd.md`、`docs/high-level-design.md`、`docs/detailed-design.md`
> 执行结果：见 `docs/test-report.md`

### 版本记录

| 版本 | 日期 | 说明 |
|------|------|------|
| v0.1 | 2026-11-05 | 初稿：策略、范围、编号规则 |
| v1.0 | 2026-11-05 | 补齐全部详细用例（§7），标注自动化落地位置，建立执行与缺陷反馈闭环 |
| v1.1 | 2026-11-09 | 部署改为 Netlify + Blobs；上传用例改为 Server Action；新增 Markdown 图片/视频与持久化用例（UP-006/007） |

## 1. 测试目标

1. 验证 ValuePass 第一版 P0 功能符合 PRD 验收标准。
2. 尽早发现注册登录、后台发布、图片上传和内容展示中的关键缺陷。
3. 保证桌面端与手机端的核心路径可用。
4. 验证 SEO、百度统计、性能与基础安全要求。
5. 为上线决策提供可复核的测试结果。

## 2. 测试范围

### 2.1 本期覆盖（In Scope）

- 首页、AI 全栈、AI 工具、经验分享、商品、关于我
- 注册、登录、退出、禁用账号、登录锁定、手动重置密码
- Studio 后台：文章、工具、商品、精选、用户管理
- Markdown 编辑与渲染
- Netlify Blobs 图片上传（本地回退 uploads/）
- 404、空状态、错误提示
- SEO：metadata、sitemap、robots、JSON-LD
- 百度统计与 2 个自定义事件
- 响应式、性能、可访问性、基础安全

### 2.2 本期不覆盖（Out of Scope）

- 在线支付、购物车、订单
- 评论、论坛、社区互动
- 英文版
- 小程序 / App
- 自助找回密码（仅人工重置）
- 站内搜索（P1，本期不实现）
- 邮件通知、短信验证

## 3. 测试分层

| 层级 | 工具 | 覆盖内容 | 执行时机 |
|------|------|----------|----------|
| 单元测试 | Vitest | slug、摘要、阅读时长、日期、校验 Schema、错误码、密码规则、登录限流、Markdown 清洗 | 每次提交 |
| 集成测试 | Vitest + 测试数据库 | 注册/登录/锁定、会话闭环、禁用失效 | 每次提交或每日 |
| E2E | Playwright（桌面 1440 + 手机 390 双项目） | PRD 十条验收、后台 CRUD、权限、SEO、接口安全 | 每次合并前 |
| 视觉回归 | Playwright 截图 | 首页、文章、工具、商品、关于、登录、后台关键页 | 每个里程碑 |
| 性能 | Lighthouse / Netlify 指标 | LCP、CLS、INP、首屏 JS | 上线前 |
| 安全 | 自动化 + 手工 | 权限、限流、XSS、上传、Cookie、SQL 注入防护 | 上线前 |
| 可访问性 | 自动化 + 手工 | 键盘、焦点、ARIA、对比度、移动端触控 | 每个里程碑 |
| SEO | 自动化 + 手工 | metadata、sitemap、robots、JSON-LD、canonical | 上线前 |
| 统计 | 手工 | 百度统计加载、2 个自定义事件 | 上线前 |

## 4. 测试环境与数据

### 4.1 环境

| 环境 | 用途 | 说明 |
|------|------|------|
| Local | 开发自测 | 本地 Next.js + 测试数据库 + 本地 uploads/ |
| Preview | 集成与验收 | Netlify Deploy Preview，禁止写生产数据 |
| Production | 上线冒烟 | 只执行只读与关键路径冒烟 |

### 4.2 测试数据

- 管理员：通过种子脚本创建，使用独立测试账号（E2E 全局准备阶段按 `.env.local` 的 `ADMIN_USERNAME` / `ADMIN_PASSWORD` 写入测试库）
- 普通用户：`user_active`、`user_disabled`（集成测试创建）
- E2E 注册测试用户：`e2e_*` 前缀随机用户名，运行前自动清理
- E2E 内容夹具（`tests/e2e/global-setup.ts` 幂等写入，发布时间固定为 2020-01-01 以保证运行期新内容始终为“最新”）：
  - 文章：`E2E 夹具文章`（已发布）/`E2E 夹具草稿`（草稿）
  - 工具：`E2E 夹具工具`（已发布）/`E2E 夹具工具草稿`（草稿）
  - 商品：`E2E 夹具商品`（上架）/`E2E 下架商品`（下架）
  - 禁用用户：`e2e_disabled` / `password8`
- 锁定用户：连续失败 5 次后验证（E2E 与集成各一份）
- 图片：JPG、PNG、WebP 各 1 张；超 5MB、非图片各 1 个（手工用例素材）
- 本地测试图片写入 `uploads/`，测试后清理；线上 Blobs 测试文件需手动清理

### 4.3 数据隔离

- 测试数据库与生产数据库分离：`TEST_DATABASE_URL` 指向独立 Neon 库
- E2E 的 Next.js 服务进程被强制注入 `DATABASE_URL=TEST_DATABASE_URL`（`playwright.config.ts`），杜绝误写开发/生产库
- 不在生产环境执行创建、删除、禁用、重置密码等写操作
- 自动化测试不得使用真实用户数据
- 测试产生的图片文件与数据库记录需可识别并清理

## 5. 用例编号与优先级

| 前缀 | 模块 |
|------|------|
| `AUTH` | 注册、登录、退出、会话、限流 |
| `HOME` | 首页与精选 |
| `ART` | 文章列表与详情 |
| `TOOL` | 工具列表与详情 |
| `PROD` | 商品列表与详情 |
| `ADMIN` | Studio 后台 |
| `UP` | 图片上传 |
| `SEO` | SEO |
| `STAT` | 百度统计 |
| `SITE` | 404、空状态、错误页 |
| `SEC` | 安全 |
| `PERF` | 性能 |
| `A11Y` | 可访问性与响应式 |

优先级：

- **P0**：上线阻断，必须全部通过
- **P1**：核心功能，必须在发布前通过
- **P2**：一般问题，可排期修复
- **P3**：轻微问题，可记录后处理

## 6. PRD 验收标准映射

| PRD 验收项 | 测试 ID | 测试类型 | 自动化位置 |
|------------|---------|----------|-----------|
| 1 发布文章后前台可见 | `ADMIN-ART-001`、`ART-001` | E2E | `tests/e2e/publish-flow.spec.ts` |
| 2 首页精选勾选/取消 | `HOME-002`、`ADMIN-FEAT-001` | E2E | 同上 |
| 3 工具详情与官网外链 | `TOOL-001` | E2E | 同上 |
| 4 商品详情与微信二维码 | `PROD-001` | E2E | 同上 |
| 5 已下架商品提示 | `PROD-002` | E2E | 同上 |
| 6 注册与重复用户名 | `AUTH-001`、`AUTH-002` | E2E / 集成 | `tests/e2e/auth.spec.ts`、`tests/integration/auth-flow.test.ts` |
| 7 登录与 5 次失败锁定 | `AUTH-004`、`AUTH-006` | E2E / 集成 | 同上 |
| 8 未登录访问后台拒绝 | `SEC-001`、`SEC-002`、`SEC-003` | E2E | `tests/e2e/smoke.spec.ts`、`tests/e2e/auth.spec.ts` |
| 9 404 与空状态 | `SITE-001`~`SITE-004` | E2E | smoke / publish-flow |
| 10 响应式与首屏性能 | `A11Y-001`、`PERF-001`、`PERF-002` | E2E / Lighthouse / 构建产物 | smoke（溢出）、构建（JS 体积）、Lighthouse（手工） |

## 7. 详细测试用例

### 7.1 认证（AUTH）

#### AUTH-001 注册成功并自动登录（P0）

- 前置：测试库就绪，用户名不存在
- 步骤：
  1. 打开 `/register`
  2. 输入合法账号（3~32 位 `[a-z0-9_]`）、密码（≥8 位）、一致的确认密码
  3. 点击「注册」
- 预期：
  - 跳转回 `/` 首页
  - Header 显示用户名
  - `vp_session` Cookie 为 httpOnly、SameSite=Lax（生产环境加 Secure）
  - `GET /api/auth/me` 返回该用户且响应头 `Cache-Control: no-store`
  - 数据库中密码为 bcrypt 哈希，非明文
- 自动化：`tests/e2e/auth.spec.ts`（AUTH-001/004/009 合并用例）、`tests/integration/auth-flow.test.ts`（密码哈希）

#### AUTH-002 用户名重复注册（P0）

- 前置：已存在用户 `u`
- 步骤：退出当前会话 → `/register` 再次使用 `u` 注册
- 预期：页面提示「该用户名已被使用」，不创建新用户，表单保留已填内容
- 自动化：`tests/e2e/auth.spec.ts`

#### AUTH-003 注册字段校验（P0）

- 前置：无
- 步骤：
  1. `/register` 提交密码 7 位
  2. 两次密码不一致再提交
- 预期：
  - 分别提示「密码至少需要 8 位字符」「两次输入的密码不一致」（字段级提示）
  - 不发起无效注册
- 自动化：`tests/e2e/auth.spec.ts`、`tests/unit/validation-auth.test.ts`（Schema 级：账号长度/字符/转小写、密码 8~72、confirmPassword 字段路径）

#### AUTH-004 登录成功并显示用户名（P0）

- 前置：已注册活跃用户
- 步骤：`/login` 输入正确账号密码并提交
- 预期：跳转 `/`，Header 显示用户名，限流计数清零
- 自动化：`tests/e2e/auth.spec.ts`（AUTH-005 用例后半段）

#### AUTH-005 登录失败统一提示（P0）

- 前置：已存在用户 `u`
- 步骤：分别以「不存在的账号」「u + 错误密码」登录
- 预期：均提示「账号或密码错误」，不区分账号是否存在（防枚举）
- 自动化：`tests/e2e/auth.spec.ts`

#### AUTH-006 连续 5 次失败锁定 15 分钟（P0）

- 前置：已存在用户 `u`，该用户名+IP 的限流计数为空
- 步骤：连续以错误密码登录 6 次（第 6 次改用正确密码）
- 预期：
  - 前 4 次提示「账号或密码错误」
  - 第 5 次起提示「尝试次数过多，请 15 分钟后再试」
  - 锁定期间正确密码同样被拒绝
  - 限流键为 `login:{username}:{ip}`
- 自动化：`tests/e2e/auth.spec.ts`、`tests/integration/auth-flow.test.ts`（计数与 locked_until）、`tests/unit/login-policy.test.ts`（键格式、阈值、锁定时长、自动解除）

#### AUTH-007 禁用账号无法登录（P0）

- 前置：存在 `status=DISABLED` 用户 `e2e_disabled / password8`
- 步骤：`/login` 使用该账号正确密码登录
- 预期：提示「该账号已被禁用，请联系站长」，不建立会话
- 自动化：`tests/e2e/auth.spec.ts`、`tests/integration/auth-flow.test.ts`（禁用后已有会话立即失效并清理）

#### AUTH-008 退出登录后会话失效（P1）

- 前置：已登录用户
- 步骤：点击 Header「退出」
- 预期：Header 恢复「登录/注册」入口；`GET /api/auth/me` 返回 `{ user: null }`；服务端会话已删除
- 自动化：`tests/e2e/auth.spec.ts`、`tests/integration/auth-flow.test.ts`（会话创建/查询/删除闭环）

#### AUTH-009 会话 Cookie 安全属性（P1）

- 前置：注册成功后
- 步骤：检查浏览器 Cookie
- 预期：`vp_session` 为 httpOnly、SameSite=Lax、Path=/、有效期 7 天；生产环境带 Secure
- 自动化：`tests/e2e/auth.spec.ts`（httpOnly/SameSite）；Secure 标志在 Preview 手工核对（本地开发环境不带 Secure）

#### AUTH-010 redirectTo 仅允许站内路径（P1）

- 前置：已注册用户
- 步骤：`/login?redirectTo=https://evil.example.com/path` 登录
- 预期：登录后落地站内首页 `/`，不发生站外跳转（防开放重定向）
- 自动化：`tests/e2e/auth.spec.ts`

#### AUTH-011 登录限流参数正确性（P2）

- 前置：无
- 步骤：单元断言
- 预期：`LOGIN_MAX_FAILURES=5`、锁定 15 分钟、IP 取 `x-forwarded-for` 首段、缺失为 `unknown`、用户名统一小写拼接
- 自动化：`tests/unit/login-policy.test.ts`

### 7.2 首页与精选（HOME）

#### HOME-001 四板块入口跳转正确（P1）

- 步骤：首页点击「AI 全栈 / AI 工具 / 经验分享 / 商品」入口
- 预期：分别进入 `/articles`、`/tools`、`/insights`、`/products`；移动端菜单可用
- 自动化：`tests/e2e/smoke.spec.ts`

#### HOME-002 精选按排序展示、最多 4 条（P0）

- 前置：测试库存在已发布/上架内容
- 步骤：后台 `/studio/featured` 勾选「E2E 夹具文章」
- 预期：首页精选区仅展示精选内容；未精选的最新内容退位；超过 4 条时只展示前 4 条
- 自动化：`tests/e2e/publish-flow.spec.ts`（勾选/取消全链路）；数据层 `getHomeData` 截取前 4 条由代码保证

#### HOME-003 无精选时回退最新 4 篇文章（P0）

- 前置：精选列表为空
- 步骤：访问首页
- 预期：精选区展示按发布时间倒序的最新 4 篇已发布文章
- 自动化：`tests/e2e/publish-flow.spec.ts`（取消精选后的断言）

#### HOME-004 空库空状态占位（P1）

- 前置：数据库无任何内容
- 步骤：访问首页与列表页
- 预期：显示「内容筹备中」占位，不出现空白页
- 自动化：`tests/e2e/smoke.spec.ts`（条件分支：有内容时断言列表链接存在，无内容时断言空状态文案）

### 7.3 文章（ART）

#### ART-001 已发布文章前台可见（P0）

- 前置：管理员已登录
- 步骤：`/studio/articles/new` 填标题、slug、正文（含 H2、加粗、代码块、恶意 script）→「发布文章」→ 访问 `/articles` 与 `/articles/{slug}`
- 预期：列表出现新文章；详情页标题、H2、代码块高亮正常
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### ART-002 详情页元信息完整（P1）

- 前置：已发布文章
- 步骤：打开详情页
- 预期：标题、摘要、发布日期（YYYY.MM.DD）、阅读时长、面包屑、「返回板块」链接齐全；输出 Article JSON-LD（headline、datePublished、author、publisher）
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### ART-003 草稿/不存在文章返回 404 页（P0）

- 前置：存在草稿文章
- 步骤：访问草稿 slug 与不存在的 slug
- 预期：显示 404 页（「这一页，还在路上」+ 回首页按钮）
- 自动化：`tests/e2e/publish-flow.spec.ts`（页面级）；HTTP 状态码见 `SITE-004`
- 已知限制：Next.js 15.5 下动态路由 `notFound()` 的 HTTP 状态码为 200（上游缺陷 vercel/next.js#99343、#99318），页面展示正确，状态码跟踪由 `SITE-004` 以 `test.fail` 承载

#### ART-004 Markdown 渲染与安全清洗（P0）

- 前置：正文包含 `## 标题`、加粗、外链、代码块、`<script>`、`javascript:` 链接、http 图片
- 预期：H2 渲染且自动带 `section-N` 锚点；H1 不渲染；原始 HTML/script 被禁用；`javascript:` 协议被移除；http 图片被剥除（仅 https）；外链 `target=_blank + rel=noopener noreferrer`；站内相对链接不开新窗口；代码块保留 `language-*` 供高亮
- 自动化：`tests/unit/markdown-content.test.tsx`、`tests/unit/markdown-text.test.ts`；E2E 在 ART-001 中断言正文中不出现 `alert(1)`

#### ART-005 摘要自动截取（P1）

- 预期：手动摘要优先；留空时取去除 Markdown 标记后的正文前 150 字
- 自动化：`tests/unit/excerpt.test.ts`

#### ART-006 阅读时长（P2）

- 预期：按 400 字/分钟，最少 1 分钟，代码块不计入
- 自动化：`tests/unit/reading-time.test.ts`、`tests/unit/markdown-text.test.ts`（代码块剥离）

#### ART-007 slug 规则（P1）

- 预期：仅小写字母/数字/连字符、1~160 位；自动生成 `{prefix}-{8位随机hex}`；冲突时报「slug 已存在」
- 自动化：`tests/unit/slug.test.ts`；冲突提示由后台编辑表单展示（手工抽查）

#### ART-008 日期格式化（P2）

- 预期：数据库 UTC 时间 → Asia/Shanghai 时区 `YYYY.MM.DD`
- 自动化：`tests/unit/date.test.ts`

### 7.4 工具（TOOL）

#### TOOL-001 工具列表与详情（P0）

- 前置：存在已发布工具
- 步骤：`/tools` → 点击卡片 → 详情页 → 检查官网按钮
- 预期：列表只显示已发布工具；详情含名称、摘要、介绍；「前往官网」href 正确、`target=_blank`、`rel=noopener noreferrer`
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### TOOL-002 草稿工具 404（P1）

- 前置：存在草稿工具
- 预期：访问草稿 slug 显示 404 页
- 自动化：`tests/e2e/publish-flow.spec.ts`（页面级）；状态码限制同 ART-003

### 7.5 商品（PROD）

#### PROD-001 商品详情与微信咨询弹窗（P0）

- 前置：存在上架商品
- 步骤：`/products` → 点击商品 → 详情页 → 点击「微信咨询这件作品」
- 预期：详情含名称、描述、图片；弹窗展示二维码图片、微信号 `aaa1024-__-`、`复制` 按钮；Esc 可关闭；弹窗为 `role=dialog`
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### PROD-002 下架商品旧链接（P0）

- 前置：存在下架商品
- 步骤：访问下架商品详情
- 预期：显示「该商品已下架」+「浏览其他商品」引导 + 其他上架商品推荐；页面 `robots` meta 为 noindex
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### PROD-003 商品列表与交易边界（P0）

- 预期：列表只显示上架商品；列表与详情均无价格数字、购物车、购买/支付/下单入口
- 自动化：`tests/e2e/publish-flow.spec.ts`（按钮断言）

#### PROD-004 多图切换与复制微信号（P1）

- 步骤：上传多图商品 → 详情页切换图片 → 点击「复制」
- 预期：主图切换正确；复制成功出现「已复制 ✓」
- 自动化：手工（依赖 Blob 上传与剪贴板权限，Preview 环境验证）

### 7.6 后台（ADMIN）

#### ADMIN-AUTH-001 后台登录（P0）

- 步骤：`/studio` 输入管理员账号密码 →「登录管理后台」
- 预期：进入 `/studio/dashboard`，顶栏显示管理员用户名
- 自动化：`tests/e2e/helpers.ts` 的 `studioLogin`（被全部后台用例使用）

#### ADMIN-AUTH-002 非管理员登录后台被拒（P0）

- 步骤：以普通用户账号在 `/studio` 登录
- 预期：提示「账号或密码错误」（不泄露权限差异），不进入后台
- 自动化：手工抽查；普通用户访问后台子路由的拒绝由 `SEC-003` 覆盖

#### ADMIN-ART-001 文章新建并发布（P0）

- 步骤：`/studio/articles` →「＋ 写一篇新文章」→ 填字段 →「发布文章」
- 预期：回到文章列表，状态为「已发布」；前台列表/详情立即可见
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### ADMIN-ART-002 撤回与删除（P1）

- 步骤：已发布文章行点击「撤回」；再点击「删除」
- 预期：撤回后状态变「草稿」、前台不可见（详情显示 404 页）；删除弹出确认框（含「删除后无法恢复」），确认后从列表移除
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### ADMIN-ART-003 草稿保存（P2）

- 步骤：编辑器填内容后点「保存草稿」
- 预期：状态为「草稿」，不出现在前台与 sitemap
- 自动化：手工抽查

#### ADMIN-TOOL-001 / ADMIN-PROD-001 工具与商品 CRUD（P1）

- 步骤：后台新建/编辑/发布/删除工具与商品（含多图）
- 预期：状态流转正确；前台随状态变化
- 自动化：手工（表单依赖 Blob 上传，Preview 环境验证）；公开端展示已由 TOOL/PROD 用例覆盖

#### ADMIN-FEAT-001 精选勾选/取消（P0）

- 步骤：`/studio/featured` 勾选与取消精选
- 预期：仅允许已发布/上架内容；勾选后首页精选位立即出现，取消后消失
- 自动化：`tests/e2e/publish-flow.spec.ts`（HOME-002 同链路）

#### ADMIN-FEAT-002 精选排序（P2）

- 步骤：精选项「↑」「↓」移动
- 预期：首页精选顺序随 sortOrder 变化
- 自动化：手工抽查

#### ADMIN-USER-001 用户禁用/启用（P0）

- 步骤：`/studio/users` 对目标用户点「禁用」→ 该用户尝试登录；再点「启用」恢复
- 预期：禁用后该用户会话删除、无法登录（提示已禁用）；管理员不可操作自己；启用后恢复正常
- 自动化：`tests/e2e/publish-flow.spec.ts`（禁用分支）；启用与自保护手工抽查

#### ADMIN-USER-002 重置密码（P0）

- 步骤：`/studio/users` 点「重置密码」输入新密码确认 → 该用户用新密码登录
- 预期：新密码 8~72 位强校验；重置后旧密码失效、该用户全部会话删除；新密码可登录
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### ADMIN-USER-003 用户列表筛选（P2）

- 步骤：按用户名查询、按状态筛选
- 预期：列表按 `created_at` 排序，筛选生效
- 自动化：手工抽查

### 7.7 图片上传（UP）

> 实现变更（2026-11-09）：上传由 Vercel Blob 客户端直传改为 Server Action `uploadImageAction` + 存储层抽象（生产 Netlify Blobs / 本地 uploads/）。

#### UP-001 类型校验（P1）

- 步骤：上传 JPG/PNG/WebP 与非图片
- 预期：三种图片成功；非图片客户端提示「仅支持 JPG/PNG/WebP 图片」，服务端返回「仅支持 JPG/PNG/WebP」
- 自动化：手工（本地 / 线上预览各验证一次）

#### UP-002 大小限制（P1）

- 步骤：上传超过 5MB 的图片
- 预期：客户端提示「图片不能超过 5MB」；服务端二次校验兜底
- 自动化：手工

#### UP-003 未登录上传被拒（P0）

- 步骤：无会话调用 `uploadImageAction`
- 预期：返回 `{ ok: false, error: '请先登录' }`
- 自动化：手工（Server Action 无法直接 HTTP 调用）；接口层由 `getCurrentUser` 统一守卫
- 备注：`tests/e2e/security.spec.ts` 中针对旧 `/api/blob-upload` 的用例需同步迁移或移除

#### UP-004 上传失败保留表单（P2）

- 步骤：上传失败后检查表单其他字段
- 预期：表单内容不丢失，可重试
- 自动化：手工

#### UP-005 存储路径与读取（P2）

- 预期：上传后返回 `/api/images/<timestamp>-<random>.<ext>`；不信任原始文件名
- 预期：`GET /api/images/<filename>` 返回正确 `Content-Type` 与 `Cache-Control: public, max-age=31536000, immutable`
- 预期：含 `/`、`\`、`..` 的文件名被拒绝（404）
- 自动化：手工 + `tests/unit/markdown-media.test.tsx`（渲染侧覆盖）

#### UP-006 持久化（P0，上线关键）

- 步骤：线上后台上传图片 → 记录 URL → 重新部署一次 → 再次访问该 URL
- 预期：图片仍可访问（Netlify Blobs 持久化）
- 自动化：手工（已验证通过：2026-11-09，重新部署后图片 200）

#### UP-007 Markdown 图片与视频（P1）

- 步骤：文章正文写入 `![图](/api/images/x.png)` 与 `<iframe src="https://player.bilibili.com/...">`
- 预期：图片正常渲染；白名单 iframe 渲染为 16:9 容器；非白名单地址显示「[不支持的视频嵌入地址]」
- 自动化：`tests/unit/markdown-content.test.tsx`、`tests/unit/markdown-media.test.tsx`
### 7.8 SEO（SEO）

#### SEO-001 页面元信息（P0）

- 步骤：抽查各公开页
- 预期：title 按 `%s｜ValuePass` 模板、description 非空、canonical 指向 `NEXT_PUBLIC_SITE_URL` 对应路径
- 自动化：`tests/e2e/seo.spec.ts`（文章详情页）

#### SEO-002 sitemap 收录规则（P0）

- 预期：含 6 个静态页 + 已发布文章/工具/上架商品；不含草稿与下架商品
- 自动化：`tests/e2e/seo.spec.ts`（用夹具内容断言含与不含）

#### SEO-003 robots（P1）

- 预期：屏蔽 `/studio`、`/api`、`/login`、`/register`，并声明 sitemap 地址
- 自动化：`tests/e2e/seo.spec.ts`

#### SEO-004 文章 JSON-LD（P1）

- 预期：文章详情输出 `@type: Article`，含 headline、description、image、datePublished、author、publisher、mainEntityOfPage
- 自动化：`tests/e2e/publish-flow.spec.ts`（ART-002 断言）

#### SEO-005 下架商品 noindex（P1）

- 预期：下架商品详情页 `robots` meta 为 noindex
- 自动化：`tests/e2e/publish-flow.spec.ts`（PROD-002 断言）

### 7.9 统计（STAT）

#### STAT-001 生产环境加载百度统计（P1）

- 步骤：Preview/生产环境查看页面源码
- 预期：存在 `hm.baidu.com` 脚本；开发环境不加载
- 自动化：手工（依赖真实统计账号与域名）

#### STAT-002 商品二维码点击事件（P1）

- 预期：点击「微信咨询」触发 `trackEvent('Product', 'open_wechat_qr', slug)`
- 自动化：手工（`_hmt` 由百度脚本注入，Local 验证 `trackEvent` 调用，Preview 验证上报）

#### STAT-003 工具官网点击事件（P1）

- 预期：点击「前往官网」触发 `trackEvent('Tool', 'visit_website', slug)`
- 自动化：手工（同上）

### 7.10 站点行为（SITE）

#### SITE-001 顶层不存在路径（P0）

- 步骤：访问 `/no-such-page`
- 预期：HTTP 404 + 404 页 + 回首页按钮
- 自动化：`tests/e2e/smoke.spec.ts`

#### SITE-002 列表空状态（P1）

- 预期：板块无内容时显示「内容筹备中」占位
- 自动化：`tests/e2e/smoke.spec.ts`（条件分支）

#### SITE-003 无内容板块（P1）

- 步骤：测试库无 PERSPECTIVE 内容时访问 `/insights`
- 预期：显示空状态占位
- 自动化：`tests/e2e/publish-flow.spec.ts`

#### SITE-004 动态路由 404 状态码（P0，上游缺陷跟踪）

- 步骤：访问草稿文章/工具 slug
- 预期：HTTP 状态码为 404
- 自动化：`tests/e2e/publish-flow.spec.ts`，`test.fail` 承载（已知上游缺陷 vercel/next.js#99343、#99318：Next.js 15.5 在 Suspense 边界/动态参数下对运行时 notFound 返回 200；页面内容正确）
- 处置：跟踪上游修复；升级 Next 后该用例自动转绿

### 7.11 安全（SEC）

#### SEC-001 未登录访问后台（P0）

- 预期：访问 `/studio` 显示后台登录页，不进入后台
- 自动化：`tests/e2e/smoke.spec.ts`

#### SEC-002 后台子路由重定向（P0）

- 预期：访问 `/studio/dashboard` 等子路由重定向到 `/studio` 登录页
- 自动化：`tests/e2e/smoke.spec.ts`

#### SEC-003 普通用户访问后台被拒（P0）

- 预期：普通用户登录后访问 `/studio/dashboard` 仍被重定向到登录页；非管理员在 `/studio` 登录提示账号或密码错误
- 自动化：`tests/e2e/auth.spec.ts`

#### SEC-004 会话接口缓存控制（P1）

- 预期：`/api/auth/me` 未登录返回 `{ user: null }`（200，不抛 401），响应头 `Cache-Control: no-store`
- 自动化：`tests/e2e/security.spec.ts`

#### SEC-005 密码哈希不可逆（P0）

- 预期：bcrypt cost 12，哈希不含明文，同一密码两次哈希结果不同
- 自动化：`tests/unit/password.test.ts`

#### SEC-006 会话 token 哈希存储（P1）

- 预期：数据库仅存 SHA-256 哈希，原始 token 不落库
- 自动化：`tests/unit/token.test.ts`、`tests/integration/auth-flow.test.ts`

#### SEC-007 Markdown XSS 清洗（P0）

- 预期：见 ART-004；错误码映射不暴露堆栈/内部路径
- 自动化：`tests/unit/markdown-content.test.tsx`、`tests/unit/result.test.ts`（错误码与提示语映射）

#### SEC-008 上传接口鉴权（P0）

- 预期：未登录调用 `/api/blob-upload` 返回 401
- 自动化：`tests/e2e/security.spec.ts`（同 UP-003）

### 7.12 性能与可访问性（PERF / A11Y）

#### PERF-001 首屏 LCP < 2s（P1）

- 工具：Lighthouse（Preview 环境）
- 预期：LCP < 2.0s、CLS < 0.1、INP < 200ms
- 自动化：手工（Preview 环境运行 Lighthouse）

#### PERF-002 首屏 JS 体积（P1）

- 预期：首屏共享 JS（gzip）< 200KB
- 自动化：`npm run build` 产物表核对（当前 103KB 共享 + 112KB 首页）

#### A11Y-001 响应式无水平溢出（P0）

- 预期：1440 / 390 / 320 宽度下 `/`、`/articles`、`/tools`、`/products`、`/about`、`/login` 无水平滚动
- 自动化：`tests/e2e/smoke.spec.ts`（双项目跑桌面/移动）

#### A11Y-002 移动端导航（P1）

- 预期：移动端汉堡菜单可打开、可导航、Esc 关闭
- 自动化：`tests/e2e/smoke.spec.ts`（mobile 项目）

#### A11Y-003 弹窗可访问性（P1）

- 预期：弹窗 `role=dialog`、Esc/遮罩/关闭按钮均可关闭、焦点陷阱有效
- 自动化：`tests/e2e/publish-flow.spec.ts`（Esc 关闭）；焦点陷阱与遮罩关闭手工抽查

#### A11Y-004 辅助属性（P1）

- 预期：图片有 alt；图标按钮有 aria-label；存在「跳到主要内容」跳转链接；`prefers-reduced-motion` 生效
- 自动化：手工抽查

## 8. 冒烟测试清单（上线前）

1. 首页可访问，导航与四板块入口正常
2. 文章列表与详情可打开
3. 工具列表与详情可打开
4. 商品详情可打开，微信二维码弹窗正常
5. 关于我页微信信息正确
6. 注册/登录/退出正常
7. 未登录访问 `/studio` 被拒绝
8. 后台发布文章后前台可见
9. 首页精选勾选/取消生效
10. 手机端核心页面布局正常

## 9. 回归策略

- 每次提交：Lint + 单元测试 + 构建
- 每次合并前：相关模块 E2E + 关键路径冒烟
- 每个里程碑：全量 E2E + 视觉回归
- 上线前：全量回归 + Lighthouse + 安全与 SEO 检查
- 修复缺陷后：执行该缺陷用例 + 相关回归用例

## 10. 缺陷分级

| 级别 | 说明 | 示例 | 处理 |
|------|------|------|------|
| P0 | 上线阻断 | 无法登录、后台越权、数据丢失 | 立即修复，修复前不发布 |
| P1 | 严重 | 核心流程不可用、发布不可见、上传失败 | 发布前必须修复 |
| P2 | 一般 | 次要页面错误、样式异常、文案错误 | 评估后修复或排期 |
| P3 | 轻微 | 细节不统一、低优先级体验问题 | 记录后处理 |

## 11. 进入与退出标准

### 进入标准

- 代码可构建、可启动
- 测试环境与测试数据就绪（`TEST_DATABASE_URL` 独立测试库 + 夹具数据）
- 对应需求与详细设计已确认
- 测试用例已编写或更新

### 退出标准

- 所有 P0 / P1 用例通过（已知上游缺陷按 `test.fail` 跟踪并在报告中声明）
- P2 缺陷已评估并记录
- 冒烟测试通过
- 性能、SEO、安全检查通过
- `docs/test-report.md` 已生成

## 12. 测试工具与命令

```bash
npm run lint          # 代码检查
npm run test          # Vitest 单元/集成测试（集成测试需 TEST_DATABASE_URL）
npm run test:e2e      # Playwright E2E（自动注入 DATABASE_URL=TEST_DATABASE_URL，强制写测试库；以生产构建 build+start 运行，避免 dev 按需编译抖动）
npm run build         # 生产构建
```

测试代码位置：

- 单元/集成：`tests/unit/`、`tests/integration/`
- E2E：`tests/e2e/`（`global-setup.ts` 负责测试库夹具；`helpers.ts` 提供公共步骤）
- 测试数据：`tests/fixtures/`
- 视觉截图：`tests/screenshots/`（不入库）

### 已知环境注意事项

- Vitest：`testTimeout` 为 15s——集成测试连远端 Neon 测试库，并行执行时单次往返可能超过默认 5s
- Playwright：断言超时 10s；串行执行（`workers: 1`）避免共享测试库的写用例互相干扰
- 桌面/移动双项目：后台管理与登录态相关用例仅在桌面项目执行（登录态仅桌面导航可见），公开页面用例双端执行

## 13. 职责与节奏

- 产品/开发/测试：站长一人承担
- 每个功能完成时同步补测试，不把测试全部留到上线前
- 每日开发结束执行单元测试与构建
- 每个阶段结束执行 E2E 与视觉回归
- 上线前输出测试报告

## 14. 风险与应对

| 风险 | 应对 |
|------|------|
| 测试环境与生产环境差异 | 使用 Netlify Deploy Preview 做验收，生产只做冒烟 |
| 线上 Blobs 测试产生垃圾文件 | 测试文件名带时间戳，定期清理 |
| 百度统计需要真实域名 | Preview/生产环境验证，Local 只验证事件调用 |
| 单人开发导致测试被跳过 | 将测试列入完成定义（Definition of Done） |
| 数据库测试污染生产 | E2E 强制 `DATABASE_URL=TEST_DATABASE_URL`；禁止生产库执行写用例 |
| 远端测试库延迟导致用例抖动 | Vitest 超时 15s、Playwright 断言超时 10s、串行执行 |
| Next.js 上游缺陷（动态路由 404 状态码） | `test.fail` 跟踪，升级 Next 后自动转绿 |

## 15. 用例模板

```text
ID：AUTH-001
模块：认证
优先级：P0
前置条件：测试数据库已初始化
步骤：
1. 打开 /register
2. 输入合法账号与密码
3. 点击注册
预期：
- 注册成功并自动登录
- Header 显示用户名
- 数据库存在该用户，密码为哈希值
```

## 16. 后续文档

- 开发完成后生成 `docs/test-report.md`
- 报告至少包含：执行范围、通过/失败统计、缺陷清单、性能与 SEO 结果、上线结论

## 17. 确认与维护

- 本测试计划随开发推进持续补充具体用例
- 需求或详细设计变更时，同步更新本计划
- 测试计划与测试报告均放在 `docs/` 目录


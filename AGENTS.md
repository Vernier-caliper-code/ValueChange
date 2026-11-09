# 项目约定

## 产品文档

- 产品需求、方案、决策等产品文档统一放在 `docs/` 目录。
- 产品文档使用 Markdown 格式，文件名使用小写英文和连字符，例如 `docs/user-authentication.md`。
- 原型说明放在 `prototype/README.md`，不要混入产品文档目录。

## 重要文档位置

| 文档 | 路径 |
|------|------|
| 产品需求文档（PRD） | `docs/prd.md` |
| 概要设计 | `docs/high-level-design.md` |
| 详细设计 | `docs/detailed-design.md` |
| 测试计划 | `docs/test-plan.md` |
| 测试报告（上线前生成） | `docs/test-report.md` |
| 原型说明 | `prototype/README.md` |
| 原型代码（仅参考） | `prototype/` |
| 正式项目代码 | `src/` |
| 品牌源素材 | `brand/` |
| 网站运行时资源 | `public/` |
| 数据库迁移 | `drizzle/` |
| 运维脚本 | `scripts/` |
| 测试 | `tests/` |

## 开发依据

- 开始任何开发任务前，必须先阅读：`docs/prd.md`、`docs/high-level-design.md`、`docs/detailed-design.md`、`docs/test-plan.md`、本文件。
- 需求、架构、数据模型或接口发生重要变化时，先更新 `docs/` 中的对应文档，再改代码。
- 详细设计是实现的直接依据；实现与文档冲突时，先停下确认，不擅自改设计。

## 代码边界

- 正式业务代码只写在 `src/`、`public/`、`drizzle/`、`scripts/`、`tests/` 等生产目录。
- `prototype/` 是冻结的设计参考，不参与正式构建；正式代码禁止 import 原型文件，也不得在原型目录中继续写业务功能。
- `brand/` 保存原始设计素材；需要对外访问的固定图片复制到 `public/`。
- `docs/` 只放文档，不写业务代码。
- 不把组件、页面或工具函数散落在项目根目录。

## 目录约定

- Next.js 页面统一放在 `src/app/`，按 App Router 组织。
- 公共组件放在 `src/components/`，按 `ui / layout / content / forms / seo` 分组。
- 服务端逻辑放在 `src/lib/`，按 `db / auth / actions / data / validation / storage / utils` 分组。
- 路由组 `(site)`、`(auth)`、`(panel)` 不改变 URL，只用于布局隔离。当前实现：`(site)` 承载前台全部页面，`(site)/(auth)` 承载登录注册，`studio/(panel)` 承载后台面板。
- 后台路径统一使用 `/studio`；登录页独立，登录后 `(panel)` 才加载后台侧栏与管理员鉴权。
- 公开页不在服务端读取 Cookie；登录态由共享 Hook `useCurrentUser`（客户端）调用 `/api/auth/me` 获取，桌面 `HeaderAuth` 与移动端抽屉共用。
- 图片上传统一走 Server Action `uploadImageAction`（`src/lib/actions/upload.ts`）+ 存储抽象 `src/lib/storage/images.ts`：生产写 Netlify Blobs，本地写 `uploads/`（已在 `.gitignore`）。读取统一经 `/api/images/[filename]` 代理，不新增其他上传接口。

## 部署约定

- 托管平台：**Netlify**（`netlify.toml` + `@netlify/plugin-nextjs`）；数据库：**Neon PostgreSQL**；图片存储：**Netlify Blobs**。
- 环境变量：`DATABASE_URL`、`NEXT_PUBLIC_SITE_URL`、`BAIDU_ANALYTICS_ID`、`ADMIN_USERNAME`、`ADMIN_PASSWORD`。Blobs 凭据由 Netlify 自动注入，无需配置。
- 部署命令：`npx netlify deploy --build --prod`；本地生产验证：`npm run build && npm run start`。
- 本机访问 Neon 报 `ECONNREFUSED` 时，先设置 `NODE_OPTIONS=--dns-result-order=ipv4first`（IPv6 出口问题，非代码缺陷）。
- 站点需保持 **Public** 可见性，否则全站返回 401。
- 详细步骤见 `docs/deployment.md`。

## 内容约定

- Markdown 正文支持：站内相对路径图片（`/api/images/...`、`/images/...`）、HTTPS 图片、白名单视频 iframe（Bilibili / 腾讯视频 / YouTube）。
- 视频一律使用第三方平台 iframe 嵌入，**不把视频文件存本站**。
- 微信号等站点常量统一维护在 `src/lib/site-content.ts`，不得在组件中硬编码。
- 页头统一只用 H1 标题（不叠加描述句与英文装饰行）；首页四板块卡片另有一套引导文案。
## 测试约定

- 测试计划：`docs/test-plan.md`；上线前生成 `docs/test-report.md`。
- 每个功能完成时必须同步补充或更新单元测试 / E2E；测试未通过不算完成。
- 单元与集成测试放在 `tests/unit/`，E2E 放在 `tests/e2e/`，测试数据放在 `tests/fixtures/`。
- 发布前所有 P0 / P1 用例必须通过，并完成冒烟、性能、SEO、安全与可访问性检查。
- 需求或详细设计变更时，同步更新测试计划与验收覆盖映射。

## 环境与安全

- `.env*`、密钥、Token、证书、CI/CD 配置不得提交到仓库。
- 管理员账号通过一次性种子脚本创建，不把明文密码写入代码或日志。
- 所有用户输入使用 Zod 校验；Markdown 必须经过清洗；数据库查询使用 Drizzle 参数化。

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
- `brand/` 保存原始设计素材；需要对外访问的图片复制到 `public/`。
- `docs/` 只放文档，不写业务代码。
- 不把组件、页面或工具函数散落在项目根目录。

## 目录约定

- Next.js 页面统一放在 `src/app/`，按 App Router 组织。
- 公共组件放在 `src/components/`，按 `ui / layout / content / forms / seo` 分组。
- 服务端逻辑放在 `src/lib/`，按 `db / auth / actions / data / validation / upload / utils` 分组。
- 路由组 `(site)`、`(auth)`、`(panel)` 不改变 URL，只用于布局隔离。
- 后台路径统一使用 `/studio`；登录页独立，登录后 `(panel)` 才加载后台侧栏与管理员鉴权。
- 公开页不在服务端读取 Cookie；登录态由 `HeaderAuth` 调用 `/api/auth/me` 获取。
- 图片上传统一使用 Vercel Blob 客户端直传与 `/api/blob-upload`，不新增普通文件上传接口。

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

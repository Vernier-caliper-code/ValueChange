# ValuePass 原型

高保真、响应式交互原型。内容与个人信息均为演示占位，不代表站长真实经历。

## 启动预览

```powershell
cd D:\AI-CODING\ValueChange\prototype
npm run dev
```

默认地址：http://localhost:4173
如需换端口：`$env:PORT=4174; npm run dev`

也可以直接运行：`node server.mjs`

## 页面地图

http://localhost:4173/prototype-map.html

- `admin/`：后台管理原型（登录、内容管理、用户管理）
- `admin/editor.html`：Markdown 编辑 + 实时预览
- `assets/`：样式、脚本、品牌图标与演示插画
- `screenshots/`：桌面 / 手机视觉验收截图
- `tests/`：Playwright 交互与响应式测试

## 测试

```powershell
cd D:\AI-CODING\ValueChange\prototype
npm install
npx playwright install chromium   # 首次需要
npm test
```

测试要求本地服务器已运行。当前测试覆盖：桌面核心路径、微信咨询弹窗、手机导航、注册校验、后台筛选与用户禁用、Markdown 预览、320–1440px 无横向溢出。

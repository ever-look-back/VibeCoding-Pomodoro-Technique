# 技术栈说明 — 番茄钟桌面应用

## 选型总览

| 层级 | 技术 | 版本 | 选型理由 |
|------|------|------|----------|
| 桌面框架 | Electron | 33.x | 跨平台桌面应用标准方案，系统托盘/通知 API 成熟 |
| UI 框架 | React | 19.x | 生态最丰富，组件化开发效率高 |
| 语言 | TypeScript | 5.x | 类型安全，减少运行时错误 |
| 构建工具 | Vite | 6.x | 开发服务器极快，HMR 体验好 |
| 样式方案 | Tailwind CSS | 4.x | 原子化 CSS，快速构建一致 UI |
| 状态管理 | Zustand | 5.x | 轻量、无 boilerplate、TypeScript 友好 |
| 持久存储 | electron-store | 10.x | JSON 文件存储，简单可靠，支持加密 |
| 打包工具 | electron-builder | 25.x | Windows 安装包/便携版一键生成 |
| 图标库 | Lucide React | — | 轻量 SVG 图标，与 Tailwind 配合好 |

## 为什么不选...

| 替代方案 | 不选的原因 |
|----------|------------|
| Vue/Svelte | React 生态更熟悉，社区资源更多 |
| Redux/Zustand 之外 | Zustand 对此项目规模足够，Redux 过重 |
| CSS Modules | Tailwind 开发速度更快，设计一致性更强 |
| SQLite | 本项目数据量极小（任务数 < 1000），JSON 文件足够 |
| electron-forge | electron-builder 对 Windows 支持更成熟 |

## 关键依赖

```json
{
  "dependencies": {
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zustand": "^5.0.0",
    "electron-store": "^10.0.0",
    "lucide-react": "^0.400.0"
  },
  "devDependencies": {
    "electron": "^33.0.0",
    "electron-builder": "^25.0.0",
    "vite": "^6.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "typescript": "^5.7.0",
    "tailwindcss": "^4.0.0",
    "@tailwindcss/vite": "^4.0.0"
  }
}
```

## 开发环境

- 操作系统：Windows 11
- 包管理器：npm（与 Node.js 捆绑）
- Node.js：22.x LTS
- IDE：VS Code

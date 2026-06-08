# CLAUDE.md — 番茄钟桌面应用

## 项目简介

一款 Windows 桌面番茄钟软件，基于 Electron + React + TypeScript 构建。帮助用户（学业压力大的学生）集中注意力完成任务，同时兼顾规律休息。

## 核心规范文件索引

| 文件 | 说明 |
|------|------|
| [docs/requirements.md](docs/requirements.md) | 需求文档：功能需求、优先级定义 |
| [docs/tech-stack.md](docs/tech-stack.md) | 技术栈：选型理由、关键依赖、版本约束 |
| [docs/design-spec.md](docs/design-spec.md) | 设计规范：UI 原则、色彩、排版、组件规范 |
| [docs/architecture.md](docs/architecture.md) | 架构设计：目录结构、数据模型、IPC、状态管理 |
| [docs/execution-steps.md](docs/execution-steps.md) | 执行步骤：分阶段开发计划、每阶段验收标准 |

## 开发日志

每次开发会话结束时，在 [devlog/](devlog/) 目录下更新当日日志（以日期命名，如 `2026-06-08.md`），记录：
- **已完成**：本次完成了什么
- **待办**：下次需要做什么
- **遇到的问题**：阻塞项或技术决策

## 工作规则

### 渐进式开发
1. **单阶段推进**：每次只做 `execution-steps.md` 中一个阶段的工作
2. **阶段完成即停**：一个阶段完成并验证通过后，更新开发日志，停止等待用户确认
3. **不跳跃**：严格按照 Phase 顺序执行，不跳过依赖阶段

### 代码质量
- TypeScript 严格模式，禁止 `any`
- 组件单一职责，可复用
- 状态管理统一使用 Zustand，不在组件内散落临时状态
- 所有 IPC 通信经 preload.ts 桥接，渲染进程不直接访问 Node.js API

### 提交与验证
- 每阶段完成后运行 `npm run dev` 验证功能
- 每阶段完成后更新 `devlog/` 日志
- 遇到需求不明确时，参照 `docs/requirements.md`，仍有疑问则询问用户

### 安全
- 渲染进程沙箱化，contextIsolation: true
- 不引入不必要的 native 依赖
- 用户数据（任务、设置、历史）仅存储在本地 appData 目录

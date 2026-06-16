---
name: netdisk-export
description: >-
  懒猫微服 LPK 网盘对接最小专题：Markdown 报告保存至网盘（inject + showSaveFilePicker）。
  用户提到网盘对接、file-chooser-inject、保存至懒猫网盘、专题、测试金字塔、fork 激励时使用。
  先读本 skill；细节按需打开 docs/ 下三篇，禁止通读全库。
---

# 网盘对接专题（Agent Skill）

## 定位

本 skill 覆盖 **一条最小链路**，目标：fork 应用接网盘 → 过审 → 拿对接激励。

```
需求确认 → 改 manifest inject → 改前端保存按钮 → 测试金字塔 → build/install → E2E 截图
```

| 文档 | 路径 | 何时读 |
|------|------|--------|
| 需求（P0 范围） | `docs/网盘对接需求.md` | 开始前 |
| 架构 | `docs/网盘对接-架构设计.md` | 写代码前 |
| 测试（金字塔） | `docs/网盘对接-测试用例.md` | 实现与提审前 |

手册交叉引用：

- inject 文件选择器：`lazycat-developer-manual/06-专题/02-自动拦截文件选择器.md`
- Skill 打包规范：`lazycat-developer-manual/06-专题/03-Skill MCP 规范.md`
- 移植主流水线：`lazycat-porting` skill

## 测试金字塔（必须遵守）

```
L3 E2E（少）  微服真网盘 + inject 弹窗 + 截图
L2 集成（中）  export-report API + mock showSaveFilePicker
L1 单元（多）  文件名、错误码、ReportGenerator、canSaveReport
```

| 阶段 | 命令 / 动作 | 通过标准 |
|------|-------------|----------|
| 开发中 | `npm test`（L1+L2） | P0 UT/IT 全绿 |
| 提审前 | 微服手工 E2E | E2E-001～006 全过 |
| 申激励 | 截图归档 | E2E-011 四张 |

**禁止倒金字塔**：不得只有手工 E2E、没有 UT/IT。

## 实现清单（Agent 执行顺序）

```
Task Progress:
- [ ] 1. 读 docs/网盘对接需求.md（确认 P0 范围）
- [ ] 2. 读 docs/网盘对接-架构设计.md
- [ ] 3. 新增 public/lazycat-injects/lzc-file-chooser-inject.js
- [ ] 4. lzc-manifest.yml 加 injects
- [ ] 5. 新增 src/lib/lazycat/save-to-disk.ts + report-filename.ts
- [ ] 6. analysis-dashboard.tsx 加「保存至懒猫网盘」
- [ ] 7. 写 L1/L2 测试（vitest）
- [ ] 8. npm test 全绿
- [ ] 9. lzc-cli project build && app install
- [ ] 10. E2E P0 + 截图
- [ ] 11. 更新 package.yml 描述
```

## 技术要点（速查）

| 项 | 做法 |
|----|------|
| 后端 | **不改**；复用 `GET /api/apps/{id}/export-report?format=markdown` |
| 前端 | `showSaveFilePicker` + Blob；**不用** `<a download>` 作为主路径 |
| manifest | `injects` + `lzc-file-chooser-inject.js` |
| 回退 | 保留原「导出 MD」本地下载 |
| 合规 | E2E 必须出现「本地 / 懒猫微服」二选一 |

## 打包进 LPK（可选）

若需让微服内 agent 也能读本 skill：

`lzc-build.yml`：

```yml
resource_exports:
  - kind: skills
    source: ./resources/skills
```

`package.yml`：

```yml
import_resources:
  - kind: skills
```

运行时路径：`/lzcapp/run/resources/skills/netdisk-export/SKILL.md`

## 输出约定

帮用户实现网盘对接时，优先给出：

1. 改动的 `lzc-manifest.yml` inject 片段
2. `save-to-disk.ts` 核心逻辑
3. 测试金字塔执行结果（L1/L2 命令 + L3 检查项）
4. 提审 / 激励截图清单

## 成功定义

**Done = L1/L2 全绿 + E2E-004/005/006 通过 + 网盘可见 .md 报告。**

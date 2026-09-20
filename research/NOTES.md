# antvis/Infographic 研究笔记(M1)

> clone: `research/antv-infographic` @ v0.2.20, MIT License
> 文档站: https://infographic.antv.vision

## 1. 它是什么

声明式信息图引擎:一段缩进 DSL → 渲染为高质量 SVG。核心卖点「AI 友好」:
语法为 AI 流式输出调优(高容错,可以边生成边 render),官方直接提供 5 个 agent skills。

## 2. 架构速览(src/)

| 目录 | 作用 |
|---|---|
| `syntax/` | DSL 解析(缩进块 → options) |
| `runtime/` | Infographic 主类(render/toDataURL/事件) |
| `renderer/` | 渲染器、palettes、fonts、stylize(rough 手绘/pattern/gradient) |
| `designs/` | **structures**(44 个结构)+ components(12 个数据项)+ title + decorations |
| `templates/` | 顶层模板注册(registry,built-in) |
| `exporter/` | exportToSVG(内嵌资源) |
| `ssr/` | **renderToString():Node 端直出 SVG**(关键!) |
| `editor/` | 内置可视化编辑器 |
| `skills/` | 5 个官方 agent skill(范本) |

## 3. SSR 机制(已实测跑通 ✅)

`@antv/infographic/ssr` → `renderToString(syntax)`:
- 用 **linkedom**(非 jsdom,轻量)做 DOM shim(`parseHTML` + 全局类注入)
- `exportToSVG(node, { embedResources: true })` 导出,图标以 `<symbol>` 内嵌
- 字体通过 `<?xml-stylesheet?>` 外链 Alibaba PuHuiTi CSS——**浏览器联网时正常,离线时回退系统字体**(我们自研层用系统字体栈规避此问题)
- 内置 10s 渲染超时

实测:`node scripts/antv-bridge.mjs --demo funnel|pyramid|line` 均成功输出 SVG。

## 4. 官方 Skill 写法范本(skills/infographic-creator/SKILL.md)

结构:frontmatter(name + description 触发条件)→ 语法硬性规则 → 各模板族数据字段规则
→ 完整正例 → 可用模板清单 → 模板选择建议 → 输出格式 → 自检清单 → 两步工作流
(理解需求→输出语法;生成 HTML:CDN 脚本 + container + render() + toDataURL 导出按钮)。

要点:
- DSL 首行 `infographic <template-name>`;`data`/`theme` 两块,2 空格缩进,`键 值` 形式,数组条目用 `-`
- 主数据字段随模板族走:list-*→lists,sequence-*→sequences,compare-*→compares,
  hierarchy-*→root/children,relation-*→nodes+relations,chart-*→values
- `theme.palette` 裸色值空格分隔;`theme.stylize` 支持 rough/pattern/linear-gradient/radial-gradient
- icon 支持精确 ID(mingcute/xxx)或语义短语(rocket launch)

## 5. 模板盘点

skill 层暴露 ~65 个模板;源码 structures 44 + components 12。已有 3D 感模板:
`sequence-ascending-stairs-3d-*`、`sequence-cylinders-3d-simple`、`sequence-zigzag-pucks-3d-simple`、
`sequence-funnel-simple`、`sequence-pyramid-simple`、`sequence-mountain-*`。
**结论:有 3D 苗头但风格偏「简洁扁平+轻透视」,缺少淘宝高级模板那种多色渐变+体积感堆叠的商务 3D——正是我们自研层的差异化空间。**

## 6. 生态(README「生态周边」)

- **infographic-cli**(lyw405)— 命令行生成 SVG,思路与我们 antv-bridge 一致
- **InfographicAI**(infographic-ai.tuntun.site)— 信息图→PPT 在线工具(商业)
- **LangChat Slides** — 基于 @antv/infographic 的 AI 幻灯片生成器
- slidev-addon-infographic / obsidian-infographic / markdown-it-infographic / rehype / docsify 插件
- feffery-infographic(Python/Plotly Dash 封装)

→ 二期做 PPTX 链路时可参考 InfographicAI 与 LangChat Slides 的做法。

## 7. 对本项目的结论

1. **antv 链路**:skill 内置「语法→HTML/CDN 渲染」与「Node SSR→SVG 文件」双通,200 官方模板白拿。
2. **自研链路**:纯字符串 SVG 模板(零依赖、系统字体、离线安全),补齐「多色高级感 3D」层。
3. 双引擎统一由 SKILL.md 调度:AI 按需求选自研组件(风格可控)或 antv 模板(数量取胜)。

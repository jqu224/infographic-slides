---
name: infographic-slides
description: 绘制高级感多色 3D 信息图(SVG/HTML),内置 16 个商务风格参数化组件(漏斗/金字塔/趋势/循环/时间轴/KPI/甘特/路线图等)与 8 套配色,并可桥接 AntV Infographic 的 200 个模板。当用户要画信息图、图表、infographic、做 PPT 配图、数据可视化、汇报图示时使用。
---

# Infographic Slides — AI 信息图绘制技能

把数据变成**高级感、多色、3D 立体**的信息图。输出 SVG(矢量、可嵌入 HTML/PPT/Markdown)。

双引擎,按需求选:

| 引擎 | 适用 | 调用方式 |
|---|---|---|
| **自研组件库**(16 个,风格可控,商务 3D 高级感) | 汇报/官网/PPT 配图 | `node scripts/render.mjs --tpl <id> --data <json>` |
| **AntV Infographic**(200 模板,MIT) | 快速出图/更多版式 | `node scripts/antv-bridge.mjs --syntax <file>` |

## 语言锁定

用户输入什么语言,标题/标签/说明就用什么语言,不要自行翻译。

## 第一步:选组件

按信息结构选(完整 schema 见 `library/<id>/meta.json`):

- **转化/占比**:funnel-3d(漏斗) · donut-3d(环形占比) · people-ratio(人物象形)
- **趋势/对比**:trend-3d(趋势,双序列) · bar-3d(分组柱状) · compare(双方 VS)
- **流程/循环**:cycle-3d(闭环) · timeline-3d(时间轴) · steps-3d(阶梯) · roadmap(S 型路线)
- **层级/结构**:pyramid-3d(金字塔) · org-tree(组织树)
- **决策/战略**:matrix-2x2(四象限) · swot(SWOT)
- **看板**:kpi-cards(指标卡) · gantt(甘特)

选型口诀:
- 有顺序、逐级递减 → funnel-3d;分层级 → pyramid-3d;随时间变化 → trend-3d
- 循环因果 → cycle-3d;节点时间点 → timeline-3d;长期阶段规划 → roadmap
- 两方案对比 → compare;四象限评估 → matrix-2x2;经典战略 → swot
- 都是数字指标 → kpi-cards;排期 → gantt;组织/职能 → org-tree
- 以上都不贴 → 尝试 antv 引擎(见下文「AntV 桥接」)

## 第二步:配色

8 套多色配色(`palettes/index.json`),**不要用单色**:

`aurora` 极光紫青(默认) · `bluegold` 蓝金商务 · `sunset` 日落珊瑚 · `emerald` 翡翠森林 · `morandi` 莫兰迪 · `corporate` 商务彩虹 · `darkneon` 暗底荧光(深色背景) · `ocean` 海洋珍珠

选法:科技/互联网 → aurora;政企/金融 → bluegold;消费/暖调 → sunset;环保/健康 → emerald;暗色页面 → darkneon。

## 第三步:渲染

### 自研库

```bash
# 示例数据渲染(先看出效果)
node scripts/render.mjs --tpl funnel-3d

# 用户数据 + 指定配色 + 输出
node scripts/render.mjs --tpl funnel-3d --data my.json --palette bluegold --out output/my-funnel.svg --html
```

- `--html` 额外生成同名 HTML(浏览器直开)
- 组件数据结构:看 `library/<id>/data.example.json`,字段见 `meta.json` 的 `dataSchema`
- 自定义尺寸:`--w 1200 --h 675`

### AntV 桥接(200 模板)

```bash
node scripts/antv-bridge.mjs --demo pyramid          # 内置演示
node scripts/antv-bridge.mjs --syntax syntax.txt --out output/x.svg
```

antv 语法速记(首行 `infographic <模板名>`,`data`/`theme` 块 2 空格缩进):

```infographic
infographic sequence-pyramid-simple
data
  title 需求分层金字塔
  sequences
    - label 战略愿景
      icon flag
theme
  palette #f59e0b #10b981 #2563eb
```

常用模板:`sequence-funnel-simple` `sequence-pyramid-simple` `chart-line-plain-text` `list-grid-badge-card` `compare-swot` `hierarchy-tree-curved-line-rounded-rect-node` `sequence-timeline-simple` `relation-dagre-flow-tb-simple-circle-node`(完整列表与规则见 `research/antv-infographic/skills/infographic-creator/SKILL.md`)

## 第四步:交付

1. **SVG 文件**(默认):给用户文件路径,可直接嵌入 HTML/Markdown(`<img src>` 或内联)、导入 Figma/Illustrator 继续编辑
2. **HTML**:`--html` 生成的单文件,浏览器打开即可查看
3. **嵌入现有 HTML**:SVG 无外链字体与外部资源,直接内联 `<body>` 即可
4. **PPT**:SVG 可直接拖入 PowerPoint(2016+)或 Keynote;也可用 2× 分辨率 PNG(`--w 1920`)保证清晰度

## 硬性规则

- 先看 `library/<id>/data.example.json` 再构造数据,字段名要对齐
- 数值字段用纯数字;单位写在 label/desc 或 unit 字段
- 组件有容量上限(见 meta.json `bestFor`),超出会被截断,宁可拆成两张图
- 文字会自动缩放截断,但中文单行别超过 20 字(数据里主动精简)
- 输出文件放 `output/`,命名 `<组件>-<主题>.svg`
- 渲染失败先看报错:多半是数据字段名不对或数组为空

## 自检清单

- [ ] 组件选型与信息结构匹配(漏斗数据递减?金字塔有层级?)
- [ ] 配色非单色,与用户行业/品牌调性一致
- [ ] 用户语言与图中文案语言一致
- [ ] 渲染成功且无截断告警;输出路径已告知用户
- [ ] 数据核对:百分比加总、数值单位、日期顺序

## 扩展

- 新增组件:`library/<新id>/`(template.js + meta.json + data.example.json),参考现有组件与 `docs/svg-drawing-guide.md`
- 调风格:改 `palettes/index.json` 或组件内渐变参数(亮面 `shade(c, 24)` / 暗面 `shade(c, -20)`)
- 3D 深度调整:组件里 `d` / `depth` 参数(等距 30° 投影,见 `library/_shared/svg.mjs` 的 `box3d`)

# infographic-slides:AI 信息图 Skill(HTML/SVG 优先,antv 引擎 + 自研 3D 高级模板层)

## 路线(已确认)
- **混合**:clone antvis/Infographic 做渲染引擎与研究对象,自研一层「3D 立体、多色高级感」参数化 SVG 模板(antv 内置风格不可控的部分)
- **输出链路**:先 HTML/SVG 打通(PPTX 链路二期,预留接口)
- **规模**:15+ 组件全家桶

## M1:把 antvis/Infographic 拉下来读透(「先 get 一下」)
1. `git clone https://github.com/antvis/infographic research/antv-infographic`,`npm install`,跑通官方 demo
2. 重点读 `.skills/` 目录 5 个官方 skill(infographic-creator 等)的 SKILL.md 写法——我们照此规范做自己的 skill
3. 验证 `@antv/infographic` 能否 Node 端 headless 直出 SVG 字符串(不能则 jsdom 兜底)
4. 摸清模板/主题扩展机制:自定义 structure/item/theme 如何注册
5. 产出 `research/NOTES.md` 架构笔记 + `RESEARCH.md`(模板站与开源项目调研结论,含上面搜到的全部来源)

## M2:仓库骨架 + 渲染管线
```
infographic-slides/
├── SKILL.md                # skill 入口:触发词、工作流、组件目录索引、参数用法
├── RESEARCH.md             # 调研结论(模板站清单+开源项目清单+搜索关键词)
├── library/                # 15+ 自研参数化组件,每个目录:
│   │   ├── template.js     #   参数化生成器(data + palette → SVG 字符串,纯 Node 可跑)
│   │   ├── preview.svg     #   默认参数渲染产物
│   │   └── meta.json       #   名称、参数 schema、适用场景、标签
│   ├── funnel-3d/  pyramid-3d/  trend-3d/  cycle-3d/  timeline-3d/
│   ├── kpi-cards/  compare/  matrix-2x2/  steps-3d/  roadmap/
│   ├── gantt/  donut-3d/  bar-3d/  people-ratio/  swot/  org-tree/
│   └── _shared/            # 投影/渐变/阴影/文字工具函数(等距矩阵、gradient 工厂)
├── palettes/               # 6-8 套多色高级配色(蓝金商务/紫青渐变/莫兰迪/暗底荧光…)
├── scripts/
│   ├── render.mjs          # CLI: --tpl funnel-3d --data data.json --palette bluegold → SVG
│   ├── catalog.mjs         # 扫 library/ × palettes/ 生成 catalog.html 预览画廊
│   └── antv-bridge.mjs     # antv 语法 → SVG 桥(200 内置模板走引擎链路)
├── docs/svg-drawing-guide.md  # 「SVG 怎么画怎么调」:等距投影、渐变、filter、排版、调试方法
└── catalog.html            # 生成产物
```

## M3:15+ 组件全家桶(风格完全可控)
- 先做 3 个标杆(funnel-3d / pyramid-3d / trend-3d)定设计语言,其余复用 `_shared` 工具
- 3D 感技术要点(沉淀进 docs):30° 等距变换矩阵 `matrix(0.866,0.5,-0.866,0.5,0,0)`、顶面亮/侧面暗的 linearGradient+radialGradient、feDropShadow、多层 path 堆叠;文字保持正投影保证可读
- 每组件 3 套配色变体,预览进 catalog.html;meta.json 的参数 schema 教 AI 怎么填参

## M4:Skill 封装(核心目标:任何人在任何地方调 AI 画图)
- SKILL.md 按 skill-creator 规范:frontmatter 触发词 + 工作流(理解需求→选组件→填参数→渲染→交付 SVG/内联 HTML)
- 双引擎:自研组件库(纯字符串模板,100% Node 可跑,不依赖浏览器)+ antv 200 模板(经 antv-bridge)
- 预留 PPTX 接口:scripts 里留 `svg2pptx.py` 占位(python-pptx 嵌 SVG/高清 PNG,二期实现)

## M5:验收
- catalog.html:15+ 组件 × 3 配色全部渲染成功,无文字溢出,多色有层次、非单色
- 端到端真实用例:给一段业务数据 → AI 选 funnel-3d → 出 SVG + 单文件 HTML
- README(中文)+ RESEARCH.md + svg-drawing-guide.md 完整

## 风险与对策
- antv 若不能 Node 直渲:自研层是纯字符串模板天然可跑,antv 链路用 jsdom 兜底——混合路线互为保险
- 手写 3D SVG 工作量大:标杆组件先行 + 工具函数复用

## 需要的权限
- git clone(拉 antvis/Infographic 到 research/)
- npm install / node 运行渲染脚本
- (预留)python pip 安装 python-pptx
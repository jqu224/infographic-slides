# infographic-slides

**AI 信息图技能库**:16 个商务 3D 高级感参数化 SVG 组件 + 8 套多色配色 + AntV Infographic 桥接(200 模板)。
任何 AI Agent(Claude Code / ZCode / Codex)装载本仓库的 `SKILL.md` 后,即可为用户把数据画成高级信息图,输出 SVG / HTML(可进 PPT)。

```bash
npm install
node scripts/render.mjs --tpl funnel-3d            # 用示例数据看效果
node scripts/render.mjs --tpl pyramid-3d --palette bluegold --out output/x.svg --html
node scripts/catalog.mjs && open catalog.html      # 全组件目录画廊
```

## 能力

- **16 个组件**:漏斗 / 金字塔 / 趋势 / 环形占比 / 循环 / 时间轴 / 阶梯 / 路线图 / KPI 卡 / 甘特 / VS 对比 / 四象限 / SWOT / 组织树 / 分组柱状 / 人物占比
- **8 套多色配色**:极光紫青 / 蓝金商务 / 日落珊瑚 / 翡翠 / 莫兰迪 / 商务彩虹 / 暗底荧光 / 海洋珍珠
- **设计语言「Aurora Glass」**:多色渐变 + 明暗面拆分 + 等距 3D + 玻璃卡片 + 柔和投影,文字正投影保证可读
- **双引擎**:自研库(风格可控、零依赖、离线安全)+ antv/Infographic(Node SSR 直出,200 模板)
- **纯字符串 SVG**:系统字体栈、无外链资源,可直接内联 HTML / 拖入 PPT / 导入 Figma

## 目录

```
SKILL.md                  # AI 技能入口(选型→配色→渲染→交付)
library/                  # 16 组件(template.js + meta.json + 示例数据)
library/_shared/svg.mjs   # 零依赖 SVG 工具箱(渐变/等距3D/文字适配/图标)
palettes/index.json       # 8 套配色
scripts/render.mjs        # 渲染 CLI
scripts/antv-bridge.mjs   # AntV 语法 → SVG(Node SSR)
scripts/catalog.mjs       # 生成 catalog.html 画廊
docs/svg-drawing-guide.md # SVG 怎么画怎么调(3D 光学/防溢出/调参地图)
RESEARCH.md               # 模板站与开源方案调研
research/antv-infographic/ # antvis/Infographic 源码(clone,MIT)
```

## 作为 Skill 使用

把本仓库放进 agent 的 skills 目录(或将其 `SKILL.md` + `library/` + `scripts/` + `palettes/` 拷入现有 skill),触发词:信息图 / 画图 / 图表 / infographic / 可视化 / PPT 配图。

## 路线

- [x] M1 antv 源码研读与 SSR 验证
- [x] M2 渲染管线与配色系统
- [x] M3 16 组件(128 组合冒烟 + 视觉 QA 通过)
- [x] M4 SKILL.md + 绘图指南
- [x] M5 catalog 画廊 + 调研文档
- [ ] M6(二期)svg2pptx:python-pptx 原生嵌入 + 版式模板套壳(参考 PPTAgent)

## 致谢

- [antvis/Infographic](https://github.com/antvis/infographic)(MIT)— 引擎与 200 模板
- 设计语言参考:SlideModel / Slidesgo / Envato 的商用 3D 信息图版式(见 RESEARCH.md)

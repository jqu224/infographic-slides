# 调研:高级感 PPT 信息图模板与开源方案

> 2026-09 调研,支撑本项目立项。核心诉求:多色不单调、3D 立体(漏斗/金字塔/趋势)、信息图元素丰富、类似「淘宝 300 页 PPT 模板包」的质感,且能被 AI 程序化生成。

## 一、去哪找「200/300 页」高级感模板(参考/扒设计用)

### 国际站(订阅制为主,质量最高)

| 站点 | 特点 | 备注 |
|---|---|---|
| [Slidesgo](https://slidesgo.com/infographics) | Freepik 旗下,**3180 套信息图**单列;免费注册每月 3 套 | 分类细:Diagram 443 / Process 309 / Timeline 202 / Chart 205;PPT+Google Slides+Canva 三格式 |
| [SlideModel](https://slidemodel.com) | 217+ 信息图包;**现成 3D 漏斗/金字塔**(如 "3D Animated 4 Step Pyramid Funnel") | 单买制,商务风浓,最接近淘宝爆款质感 |
| [Envato Elements](https://elements.envato.com) | 订阅制海量(数万套),含 animated | 大而全,搜 "infographic" 按下载量排序 |
| [Infographia](https://www.infographia.com) | **专精信息图图形素材**(不做整套主题) | Reddit r/powerpoint 公认的 shapes/diagrams 首选 |
| [SlideKit](https://www.slidekit.com) / [SlideEgg](https://www.slideegg.com) / SlidesCarnival / SlidesMania / PresentationGO | 免费为主的补充源 | SlidesCarnival/SlidesMania 免费可商用居多 |

### 中文站(淘宝模板的上游)

| 站点 | 特点 |
|---|---|
| 稻壳儿 Docer(WPS) | 国内最大,搜「立体金字塔/立体漏斗」→ 图表素材-立体图形 分类 |
| Pikbest / 千图网 58pic / 包图网 | 会员制,漏斗/金字塔信息图素材量大 |
| 第一PPT(1ppt) / 优品PPT | **免费**,「精致彩色微立体金字塔PPT图表」这类老资产很多 |

### 搜索关键词(中英)

- EN:`3D funnel pyramid infographic slides` · `isometric infographic PowerPoint` · `editable infographic bundle 200 slides` · `premium data visualization deck`
- CN:`3D立体 金字塔 漏斗 信息图表` · `微立体 PPT图表 素材` · `商务汇报 信息图 模板包`

### 选模板的判断标准(本项目审美基线)

1. **拒绝单色**:一套图至少 4 色循环 + 1 强调色(本库 8 套 palette 同构)
2. **有光源**:亮面/暗面拆分 + 统一投影方向 = 立体感来源
3. **文字永远正投影**,数字层级 ≥ 主文字 1.5 倍
4. 图形-标注关系清楚:引线/徽章/胶囊,而不是裸放

## 二、GitHub 开源方案(结论:有,且是本项目的底座)

### 主力:[antvis/Infographic](https://github.com/antvis/infographic)(MIT)

阿里 AntV 的声明式信息图引擎:缩进 DSL → 高质量 SVG;**AI 友好**(为流式生成调优);~200 内置模板;主题/手绘/渐变风格化;自带 5 个官方 agent skills(Claude/Codex 可直装);**Node SSR 直出 SVG**(`renderToString`,linkedom)。详见 `research/NOTES.md`。

### 生态(基于 antv/Infographic)

- [infographic-cli](https://github.com/lyw405/infographic-cli) — 命令行出 SVG(与本库 antv-bridge 同思路)
- [InfographicAI](https://infographic-ai.tuntun.site/) — 信息图→PPT 在线工具(商业,二期参考)
- [LangChat Slides](https://github.com/TyCoding/langchat-slides) — AI 幻灯片生成器
- slidev-addon / obsidian / markdown-it / rehype / docsify 插件族

### 相关但不同赛道

| 项目 | 定位 | 与本项目关系 |
|---|---|---|
| [PPTAgent](https://github.com/ictnlp/PPTAgent)(ICML 2025) | 编辑真实 PPT 模板生成演示 | 二期「PPTX 模板套壳」参考 |
| [Presenton](https://github.com/presenton/presenton)(~10k★) | 本地优先 AI presentation(BYOK) | 端产品形态参考 |
| SlidesGPT | LLM+Marp | Markdown 路线 |
| vega-lite / ECharts / D3 | 图表语法/库 | 数据图表渲染器,非「信息图版式」 |
| anthropics/skills(document-skills) | 官方 pptx/docx skill | PPTX 生成工具链(python-pptx) |

## 三、定位结论

1. 「AI 画高级信息图」的**引擎问题已被 antv 解决**(语法+200 模板+SSR),直接桥接
2. antv 模板风格偏「简洁扁平轻透视」,**缺淘宝爆款那种多色渐变+体积堆叠商务 3D** → 本仓库自研 16 组件补位,风格完全可控
3. 模板站(一)不再用于「买模板」,而是**扒设计语言**(配色/构图/3D 处理)喂给组件库迭代

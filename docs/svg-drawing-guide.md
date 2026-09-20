# SVG 信息图绘制与调优指南

> 本仓库的实战总结:SVG 怎么画、3D 感怎么来、文字怎么不溢出、在哪里调参数。

## 1. SVG 基本心智模型

```
<svg viewBox="0 0 960 540" width="960" height="540" font-family="...">
  <defs>…渐变/滤镜/裁剪(只定义不渲染)…</defs>
  <rect/> 背景层
  <g>…图形层(自下而上叠加)…</g>
  <text>…文字层(永远最后画,保证可读)…</text>
</svg>
```

- **viewBox 是逻辑坐标系**,960×540 = 16:9;改 viewBox 即换画布,元素坐标不用动
- **绘制顺序 = 层叠顺序**:后画的盖住先画的。做 3D 堆叠(漏斗/金字塔)时**自底向上**画,上层覆盖接缝
- SVG 是纯文本,可 `git diff`、可 sed 批量改色、可内联 HTML

## 2. 五个高频绘图原语

| 原语 | 要点 |
|---|---|
| `<path d="M x,y L … Z">` | 一切复杂形状。M 起笔 / L 直线 / A 弧 / Z 闭合。梯形、侧面、饼切全部用 path 拼 |
| `<linearGradient>` | 体积感核心。同色 `shade(+24)` → `shade(-18)` 垂直排列,平面立刻变「面光」 |
| `<filter><feDropShadow>` | 柔和投影,dy=6~8、blur/2=7、opacity 0.15 左右最「贵」 |
| `<ellipse>` | 3D 顶面:rx=宽/2、ry=rx×0.24(压扁比),放在层顶边就是「椭圆开口」 |
| `<text>/<tspan>` | 多行用 tspan dy 递进;`text-anchor: middle` 居中 |

## 3. 3D 立体感的四个来源(重要度排序)

1. **明暗面拆分**:一个盒子 = 顶面(提亮 +24)· 正面(基色+渐变)· 侧面(压暗 -20)。光照方向全图统一(本库:左上光)
2. **渐变**:垂直渐变给「面」受光;水平渐变给「圆柱」感(左高光右阴影)
3. **投影(feDropShadow)**:脱离背景 = 悬浮 = 立体
4. **等距投影**:30° 轴测,数学就一行:
   ```
   sx = (x - y) × cos30°    sy = (x + y) × sin30° - z
   ```
   本库封装在 `_shared/svg.mjs` 的 `box3d()`:正面矩形(x,y,w,h) + 深度 d,自动生成三面
   简版(不需要真投影时):把顶/侧面用 `(dx, -dy)` 平移即可,`dx = d·cos30 ≈ 0.87d`,`dy = d·sin30 ≈ 0.5d`

**反面教材**:PowerPoint 默认艺术字之所以「土」,就是只加阴影不拆光面、单色无渐变、无统一光源。

## 4. 文字不溢出的三板斧

1. **估宽**:CJK ≈ 1×字号,拉丁 ≈ 0.55×字号(本库 `textWidth()`,实测误差 <8%)
2. **缩字**:`fitSize()` 从目标字号往下找,能塞下的最大字号(下限 10px,再小不可读)
3. **截断**:`ellipsis()` 超宽加 `…`;数据层面主动控制:中文标签 ≤ 12 字,desc ≤ 20 字

多行:`tspan` + `dy = size × 1.45` 行距。数字永远 `font-weight ≥ 700`。

## 5. 本仓库的调参地图

| 想改什么 | 去哪改 |
|---|---|
| 整体配色/明暗基调 | `palettes/index.json`(series 数组循环取色) |
| 3D 深度/厚度 | 组件里的 `d`、`depth`、`hgt` 变量 |
| 光照强度 | `_shared/svg.mjs` → `volGradient` 的 top/bottom 默认值(±24/-18 是甜点区,超过 ±40 就假) |
| 圆柱感 | 漏斗的 `f3cyl` overlay 透明度(0.16;想要更硬朗调到 0.22) |
| 投影软硬 | `dropShadow()` 的 blur 与 opacity |
| 画布/边距 | `render({w, h})`;内容区统一 `padding 48` |
| 装饰光斑 | `blobs()` 的 r(半径)与 o(透明度),默认 0.06~0.10 |

## 6. 新增一个组件的套路

1. `library/<id>/template.js`:导出 `render({data, palette, w, h, opts})` 返回 SVG 字符串
2. 骨架照抄任一现有组件:header → blobs → 主体(自底向上)→ 标注 → svgDoc 收尾
3. 数据契约:`data.title/subtitle` + 一个主数组;容量上限写在 meta 的 `bestFor`
4. `meta.json`(id/label/category/tags/desc/dataSchema)+ `data.example.json`
5. 验证:`node scripts/render.mjs --tpl <id> --palette darkneon`(浅色过了,再过暗色基本就稳)

## 7. 常见坑(踩过的)

- **层间断缝**:分段图形之间留 gap 会显「断裂」;要么 gap=0 让上层覆盖,要么接缝处画深色落影带(见 pyramid)
- **伪 3D 穿帮**:拉伸面没有沿轮廓斜边走,会伸出「翅膀」——侧壁四点必须取自本体边缘坐标
- **渐变 id 冲突**:内联多张 SVG 到同一 HTML 时,`<defs>` id 会串;id 里带组件前缀+序号(本库已做)
- **字体**:不要用外链字体(离线/内联场景失效),系统字体栈 + `font-weight` 拉层次
- **文字测量的幻觉**:SVG 无法真正测宽,只能估;宁可保守(估宽系数调大 5%)

## 8. 嵌入 PPT 的姿势

- PowerPoint 2016+/Keynote 直接拖入 SVG,保持矢量可缩放
- 需要位图时:`--w 1920` 渲染 2× 分辨率再转 PNG(macOS:`qlmanage -t -s 1920 -o . x.svg`)
- 想让图「长在」母版里:把 SVG 拖入后右键 → 转换为形状( PowerPoint 支持有限,复杂渐变会丢,保守做法仍是图片模式)

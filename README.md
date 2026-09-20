<div align="center">
<img src="docs/assets/hero.svg" width="100%">
</div>

<div align="center">
<pre>~/infographic-slides (main*)   components 16   palettes 9   render-matrix 144/144</pre>
</div>

<div align="center">

[![EN](https://img.shields.io/badge/EN-English-123A2B?style=for-the-badge&labelColor=0d1117)](README.md) [![ZH](https://img.shields.io/badge/ZH-%E7%AE%80%E4%BD%93%E4%B8%AD%E6%96%87-8b949e?style=for-the-badge&labelColor=0d1117)](README.zh-CN.md)

</div>

## infographic-slides

AI-drawn business infographics, rendered as clean SVG.

— **16 three-dimensional components · 9 multi-hue palettes · 200 extra templates through the AntV bridge.**

![components](https://img.shields.io/badge/components-16-123A2B?style=flat-square)
![palettes](https://img.shields.io/badge/palettes-9-123A2B?style=flat-square)
![output](https://img.shields.io/badge/output-SVG%20%2F%20HTML-555555?style=flat-square)
![core deps](https://img.shields.io/badge/core%20deps-0-555555?style=flat-square)
![runtime](https://img.shields.io/badge/node-%E2%89%A5%2018-123A2B?style=flat-square)
![antv bridge](https://img.shields.io/badge/antv%20bridge-200%20templates-555555?style=flat-square)

**infographic-slides** is a drawing skill for AI agents: point it at raw numbers and it returns boardroom-grade SVG infographics — funnels, pyramids, trend rooms, cycle loops, KPI boards, gantt charts — ready to drop into HTML pages, Markdown, PowerPoint and Figma.

**Tips for getting started**

1. Read [SKILL.md](SKILL.md) — the workflow an agent follows: pick a component, pick a palette, render, deliver.
2. Run `node scripts/render.mjs --tpl funnel-3d` — example data, zero flags, first SVG in seconds.
3. Open `catalog.html` — the full gallery of all 16 components × 9 palettes; rebuild it any time with `node scripts/catalog.mjs`.

---

| | Positioning |
|---|---|
| **What it is** | A parameterized SVG infographic library plus an agent skill entry, tuned for premium multi-hue 3D business styling |
| **Who renders it** | Any coding agent (Claude Code, ZCode, Codex, Cursor) or a human with Node ≥ 18 |
| **Core dependency** | Zero — the core renderer is pure string templating with a system-font stack, safe offline |
| **Extra engine** | `scripts/antv-bridge.mjs` drives [antvis/Infographic](https://github.com/antvis/infographic) (MIT) server-side for 200 additional templates |
| **Visual rule** | Multi-hue series palettes with split light/shadow faces and a single top-left light source; blue-purple as a dominant scheme is a banned default |

| Pipeline | |
|---|---|
| **Render path** | data in, one component + one palette out, SVG files on disk |
| **Verify** | Full component × palette matrix renders in `node scripts/catalog.mjs` (currently 144/144); each component keeps an example dataset under `library/<id>/` |

```text
user data ──► SKILL.md picks component + palette ──┬─► library/<id>/template.js ──► render.mjs ──► output/*.svg (+ --html)
                                                   └─► scripts/antv-bridge.mjs ──► @antv/infographic SSR
all SVGs ──► scripts/catalog.mjs ──► catalog.html gallery
```

| Repository layout | |
|---|---|
| `SKILL.md` | Agent-facing skill entry: component selection, palette rules, render commands, delivery checklist |
| `library/` | 16 components, one folder each: `template.js` + `meta.json` + `data.example.json` |
| `library/_shared/svg.mjs` | Zero-dependency SVG toolkit: volume gradients, isometric 3D boxes, text fitting, mini icon set |
| `palettes/index.json` | 9 multi-hue palettes; first entry is the default (`verdant`) |
| `scripts/render.mjs` | CLI: `--tpl <id> --data <json> --palette <id> --out <svg> --html` |
| `scripts/antv-bridge.mjs` | AntV Infographic syntax → SVG via Node SSR (linkedom) |
| `scripts/catalog.mjs` | Rebuilds `catalog.html`, the component × palette gallery |
| `docs/svg-drawing-guide.md` | How the SVGs are drawn and tuned: 3D optics, overflow control, parameter map |
| `docs/assets/hero.svg` | Repository hero banner |
| `examples/` | Realistic input datasets for end-to-end trials |
| `research/` | Upstream research notes; the antvis clone stays untracked |

| Contracts | |
|---|---|
| **Component** | `template.js` exports `render({ data, palette, w, h, opts }) → svg string`; `meta.json` declares id, category, tags, data schema and capacity (`bestFor`) |
| **Palette** | Each palette carries `series[]` (multi-hue, cycled by index), `text`, `subtext`, `line`, `bg`, `accent`, `dark`; component IDs prefix gradient IDs to stay safe when inlined |
| **Data** | `title` + `subtitle` + exactly one main array field per component; numeric values stay numeric; per-component capacity caps in `meta.json` are hard limits |

| Usage | Command |
|---|---|
| Render with example data | `node scripts/render.mjs --tpl funnel-3d` |
| Real data + palette + HTML wrapper | `node scripts/render.mjs --tpl pyramid-3d --data examples/saas-funnel.json --palette bluegold --html` |
| Bridge to the 200 AntV templates | `node scripts/antv-bridge.mjs --demo pyramid` |
| Render AntV syntax from a file | `node scripts/antv-bridge.mjs --syntax examples/antv-org-sytax.txt --out output/timeline.svg` |
| Rebuild the gallery | `node scripts/catalog.mjs` |

| For AI agents | |
|---|---|
| **Install** | Copy `SKILL.md` + `library/` + `scripts/` + `palettes/` into the agent's skill directory, or point the agent at this repository |
| **Trigger** | Mentions of 信息图 / 图表 / infographic / 可视化 / PPT 配图 |
| **Language lock** | Chart copy follows the user's input language |
| **Selection** | Decreasing stages → `funnel-3d`; hierarchy → `pyramid-3d`; time series → `trend-3d`; loops → `cycle-3d`; milestones → `timeline-3d`; two-sided choice → `compare`; strategy scan → `swot`; metric rows → `kpi-cards`; schedules → `gantt` |

# Deck & Template Source Index

> Verified 2026-09-24. Companion to [RESEARCH.md](../RESEARCH.md): while that file covers template *marketplaces* (mostly paid/subscription) and the AntV engine, this index lists channels where **actual slide source files** can be downloaded free — for mining infographic layout / color / 3D-styling patterns that feed the 16-component library.
>
> Usage stance: **abstract patterns, never redistribute assets** (see §4). The local starter corpus lives in `research/corpus/` (untracked, same treatment as `research/antv-infographic/`).

## 1. GitHub repositories with real deck sources

### Real PPTX / deck files in the repo

| Repo | Stars | License | Format | What's inside |
|---|---|---|---|---|
| [GordenSun/GordenPPTSkill](https://github.com/GordenSun/GordenPPTSkill) | ~3.1k | personal/research only | `.pptx` | 17 hand-polished templates incl. `mckinsey-style`, `premium-corp`, `data-viz-deck`; each dir = `template.pptx` + `preview.png`. Best visual match for premium consulting style. |
| [hugohe3/ppt-master](https://github.com/hugohe3/ppt-master) | ~56k | MIT | native `.pptx` | Native-PPTX generator (skill + scripts). Example decks live in the companion repo [ppt-master-examples](https://github.com/hugohe3/ppt-master-examples) (~1 GB, sparse-clone single projects, e.g. `ppt169_apple_fy2025_review`, `ppt169_china_telecom_2025`). |
| [ai-ppt-template/free-ppt-template](https://github.com/ai-ppt-template/free-ppt-template) | 750 | non-standard (verify) | pptx via CDN links | Index of 4000+ templates, categorized (`business.md`, `finance.md`, `data-and-charts.md`), each row a direct `.pptx` download URL. |
| [microsoft/WhatTheHack](https://github.com/microsoft/WhatTheHack) | 1.9k | MIT | `.pptx` | Real Microsoft event/lecture decks across ~50 hack folders; `000-HowToHack/` holds the master templates. |
| [midovislam/awesome-pitch-decks](https://github.com/midovislam/awesome-pitch-decks) | 67 | index only | PDF (Google Drive) | 754 real startup decks (Airbnb '08, Uber '08, Figma, Canva, Tesla…), indexed in `deck_index.csv`. |

### Layout logic open-sourced as code (cleanest licenses — safe to adapt)

| Repo | Stars | License | What's inside |
|---|---|---|---|
| [seulee26/mckinsey-pptx](https://github.com/seulee26/mckinsey-pptx) | 590 | MIT | 40 MBB-style layouts (2x2s, pyramids, waterfalls, KPI banners) as python-pptx code — effectively a clean-room layout ontology. |
| [likaku/Mck-ppt-design-skill](https://github.com/likaku/Mck-ppt-design-skill) | 288 | Apache-2.0 | 70 consulting layout patterns + examples/assets. |
| [matze/mtheme](https://github.com/matze/mtheme) | ~6.9k | CC-BY-SA-4.0 | Metropolis — the de-facto premium LaTeX Beamer theme; `.sty` *is* the layout spec. |
| [webslides/WebSlides](https://github.com/webslides/WebSlides) | ~6.3k | MIT | HTML/CSS slide components: grids, cards, media+text blocks. |
| [slidevjs/themes](https://github.com/slidevjs/themes) | 218 | MIT | Official Slidev themes: `seriph`, `apple-basic`, `bricks`. |
| [nico-bachner/slidev-theme-geist](https://github.com/nico-bachner/slidev-theme-geist) | 116 | MIT | Vercel Geist — the "premium big-tech SaaS" look. |
| [martinbjeldbak/ultimate-beamer-theme-list](https://github.com/martinbjeldbak/ultimate-beamer-theme-list) | 1.8k | index | Master index of Beamer themes (auriga/arguelles/focus are MIT-ish highlights). |

## 2. Free sites with editable source downloads

| Site | Free editable source | Formats | License catch |
|---|---|---|---|
| [PresentationGO](https://www.presentationgo.com/) | Yes — unlimited, no login | pptx/potx, Google Slides | Attribution required; best catalog of business infographic diagrams (matrices, funnels, 3D shapes, gantts). |
| [SlidesCarnival](https://www.slidescarnival.com/) | Yes — unlimited, no login | pptx, GSlides, Canva | CC BY 4.0 — the cleanest reusable license. |
| [Slidesgo](https://slidesgo.com/) | Free tier = 3/month, login | pptx, GSlides, Canva | **Terms explicitly forbid using templates/metadata for AI/ML training** — exclude from any automated pipeline. |
| [Figma Community](https://www.figma.com/community/search?model_type=files&q=presentation&resource_type=mixed) | Yes — full-source duplicate | `.fig` | Per-file license; sort by Most liked. |
| [Microsoft Create](https://create.microsoft.com/en-us/powerpoint-templates) | Yes — direct download | pptx/potx | Official, conservative corporate. |
| Keynote built-in themes | Yes (~30 themes, free with Keynote/iCloud) | `.key` | Annual Report / Modern Focus are master-class typography grids. |
| [FPPT](https://www.free-power-point-templates.com/) | Yes — 17k+ files | pptx | Commercial use stated OK; dated 3D-bevel style is actually useful as classic-3D reference. |
| [Canva](https://www.canva.com/) | Yes via Share → pptx export | pptx out | Free elements only; export fidelity loss makes it a weak pixel-study source. |

Excluded: Pitch.com (pptx export is paid), Templately (no PowerPoint), SlideHunter (no license page at all).

## 3. Real corporate decks (free downloads, design-study reference)

### Big tech

| Source | Where | Notes |
|---|---|---|
| NVIDIA IR | [investor.nvidia.com](https://investor.nvidia.com) → Events & Presentations | Widely considered the best-designed investor decks in tech; Investor Day 2022 = 82-page PDF. Quarterly + events. |
| Microsoft | [aka.ms/KPIFY27](https://aka.ms/KPIFY27) | **The only native .pptx direct download among big tech** (FY27 Segments & Investor Metrics, refreshed each Sept) — open it to inspect slide masters, fonts, chart objects. Earnings decks: [microsoft.com/investor](https://www.microsoft.com/en-us/investor). |
| Meta | [investor.atmeta.com](https://investor.atmeta.com) → Investor Events | Minimalist typography-driven quarterly slide PDFs. |
| Apple / Alphabet | — | **Negative finding: neither publishes slide decks** (press-release PDFs only). Don't waste time looking; use keynote videos for Apple instead. |

### Investment banks

| Source | Where | Notes |
|---|---|---|
| JPMorgan | [jpmorganchase.com/ir/investor-day](https://www.jpmorganchase.com/ir/investor-day) | Investor Day every May; the 2025 deck is 151 slides of high-density corporate design. |
| Goldman Sachs | [goldmansachs.com/investor-relations](https://www.goldmansachs.com/investor-relations) | Marquee strategy deck: Investor Day Feb 2023. |
| Morgan Stanley | [morganstanley.com/investor-relations](https://www.morganstanley.com/investor-relations) | Quarterly earnings decks only — few public strategy decks. |
| SEC EDGAR (universal fallback) | [full-text search](https://www.sec.gov/edgar/search/#/q=%22investor%20presentation%22&forms=8-K) | Investor decks are filed as EX-99.1/99.2 exhibits — HTML with **per-slide JPGs, individually downloadable**. JPM archive reaches back to 2006. Works when IR sites bot-block. |

### Consulting (infographic-dense PDFs, free without login)

| Source | Where | Notes |
|---|---|---|
| McKinsey / MGI | [mckinsey.com/mgi](https://www.mckinsey.com/mgi) | The industry-standard chart-deck grammar: unit charts, exhibit-numbered layouts. ~15-20 full-report PDFs/year. |
| BCG | [bcg.com/publications](https://www.bcg.com/publications) | Matrix/2x2 heritage; flagship PDFs free. |
| Bain | [bain.com/insights](https://www.bain.com/insights/) | Cleanest bar/waterfall chart grammar; annual Private Equity Report. |

### Pattern-search tools & bonus

- [Slidebook](https://www.slidebook.io) — 6k+ real decks / 194k slides searchable by slide concept ("flywheel", "go-to-market", "Investor Day"); freemium.
- [Slidebean pitch deck examples](https://slidebean.com/pitch-deck-examples) — 35+ famous decks (redesigned versions).
- IMF [WEO](https://www.imf.org/en/Publications/WEO) / World Bank [WDR](https://www.worldbank.org/en/publication/world-development-report) — CC/open-access report PDFs; superb data-viz grammar, most permissive licenses in this list.

## 4. License safety rules (for this project's use case)

1. Abstracting **layout / palette / composition patterns** is fine from every source above — design ideas are not copyrightable.
2. Reusing or redistributing **assets** (slide art, photos, icons) requires the file's license: only treat MIT/Apache/CC-BY material as adaptable (mckinsey-pptx, Mck-ppt-design-skill, ppt-master, WhatTheHack, SlidesCarnival, IMF/World Bank).
3. Corporate decks (NVIDIA, JPM, Airbnb…) stay the company's IP even when hosted in MIT repos — reference only.
4. GordenPPTSkill is "personal/research use only"; Slidesgo forbids AI/ML training use. Keep both out of any automated extraction pipeline.
5. `research/corpus/` is gitignored — nothing from these sources ever enters git history.

## 5. Starter corpus (`research/corpus/`, untracked)

```text
research/corpus/
├── repos/                          # shallow clones (see §1)
│   ├── mckinsey-pptx/              (MIT, 40 MBB layouts as code)
│   ├── Mck-ppt-design-skill/       (Apache-2.0, 70 consulting patterns)
│   ├── GordenPPTSkill/             (personal/research, 17 real pptx incl. mckinsey-style)
│   ├── ppt-master/                 (MIT, generator skill)
│   ├── ppt-master-examples/        (sparse: apple_fy2025_review, china_telecom_2025,
│   │                                china_economy_2025_briefing, ev_market_priorities,
│   │                                heatline_seed_pitch → 9 native pptx in exports/)
│   └── WhatTheHack/                (MIT, sparse: 000-HowToHack master templates)
└── decks/
    ├── corporate/
    │   ├── nvidia-investor-day-2022.pdf          (82 pp, 38 MB)
    │   ├── nvidia-investor-presentation-oct-2024.pdf
    │   ├── msft-fy27-segments-kpi.pptx           (native pptx via aka.ms/KPIFY27)
    │   └── jpm-investor-day-2025/                (151 slide JPGs from EDGAR EX-99.2)
    ├── free-sites/
    │   ├── pgo-*.pptx                            (3 × PresentationGO: matrix / workflow / analogy)
    │   └── sc-*.pptx                             (3 × SlidesCarnival business decks)
    └── pitch/                      # 4 real startup decks (Airbnb '08, Buzzfeed '08,
                                     #  AppNexus '07, Brex '18) — moved from research/pitch-decks/
```

Download recipes worth keeping: template sites hide direct links behind JS — PresentationGO serves files at `/download/<slug>/` and SlidesCarnival at `/download/<id>/<slug>/pptx`; SEC EDGAR needs a plain `User-Agent` (e.g. `ResearchAgent contact@example.com`), browser UAs get 403; github.com goes through the local Surge proxy (see `~/.cursor/rules/local-proxy-for-github.mdc`).

Refresh: re-run the clones/downloads in this file's tables; nothing here is meant to be committed.

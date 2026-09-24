#!/usr/bin/env node
/**
 * catalog.mjs — 生成 catalog.html:16 组件 × 9 配色全量预览画廊
 * node scripts/catalog.mjs [--only-default]  (默认全配色,--only-default 只渲染默认配色)
 */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listComponents, renderComponent, getPalettes } from '../library/index.js';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const onlyDefault = process.argv.includes('--only-default');

async function main() {
  const comps = listComponents();
  const palettes = getPalettes();
  const cards = [];

  for (const c of comps) {
    const variants = [];
    const pals = onlyDefault ? palettes.slice(0, 1) : palettes;
    for (const p of pals) {
      const svg = await renderComponent(c.id, { paletteId: p.id });
      // 去掉 width/height,让它自适应卡片
      const fluid = svg.replace(/width="\d+" height="\d+"/, 'width="100%" style="aspect-ratio:16/9"');
      variants.push({ id: p.id, label: p.label, svg: fluid });
    }
    const options = variants
      .map((v, i) => `<option value="${i}"${i === 0 ? ' selected' : ''}>${v.label}</option>`)
      .join('');
    const panes = variants
      .map((v, i) => `<div class="pane" data-i="${i}"${i === 0 ? '' : ' hidden'}>${v.svg}</div>`)
      .join('');
    cards.push(`
<section class="card" data-category="${c.category ?? ''}">
  <header>
    <div>
      <h3>${c.label} <code>${c.id}</code></h3>
      <p class="desc">${c.desc ?? ''}</p>
    </div>
    <select title="切换配色">${options}</select>
  </header>
  <div class="panes">${panes}</div>
  <footer class="tags">${(c.tags ?? []).map((t) => `<span>${t}</span>`).join('')}</footer>
</section>`);
  }

  const cats = [...new Set(comps.map((c) => c.category ?? '其他'))];
  const nav = cats.map((cat) => `<a href="#cat-${cat}">${cat}</a>`).join('');
  const sections = cats
    .map((cat) => {
      const inner = cards.filter((c) => c.includes(`data-category="${cat}"`)).join('\n');
      return `<h2 id="cat-${cat}">${cat}</h2><div class="grid">${inner}</div>`;
    })
    .join('\n');

  const html = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Infographic Slides · 组件目录</title>
<style>
  :root { color-scheme: light; }
  body { margin: 0; font-family: -apple-system, 'PingFang SC', 'Microsoft YaHei', sans-serif; background: #f2f4f9; color: #1e293b; }
  nav { position: sticky; top: 0; z-index: 9; display: flex; gap: 14px; flex-wrap: wrap; padding: 12px 28px; background: rgba(255,255,255,.85); backdrop-filter: blur(8px); border-bottom: 1px solid #e2e8f0; }
  nav a { color: #475569; text-decoration: none; font-size: 13px; font-weight: 600; padding: 4px 10px; border-radius: 999px; }
  nav a:hover { background: #e8f0ea; color: #123A2B; }
  h1 { padding: 28px 28px 0; margin: 0 0 4px; font-size: 24px; }
  .sub { padding: 0 28px 8px; color: #64748b; font-size: 13px; }
  h2 { padding: 22px 28px 8px; margin: 0; font-size: 17px; color: #334155; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(430px, 1fr)); gap: 20px; padding: 8px 28px 28px; }
  .card { background: #fff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 16px; box-shadow: 0 2px 10px rgba(15,23,42,.05); }
  .card header { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 10px; }
  .card h3 { margin: 0; font-size: 15.5px; }
  .card code { font-size: 11.5px; color: #1e7a52; background: #e8f0ea; padding: 2px 7px; border-radius: 6px; }
  .desc { margin: 6px 0 0; font-size: 12px; color: #64748b; }
  select { font-size: 12.5px; padding: 6px 8px; border-radius: 8px; border: 1px solid #cbd5e1; background: #fff; }
  .panes { border-radius: 12px; overflow: hidden; border: 1px solid #eef2f7; }
  .tags { margin-top: 10px; display: flex; flex-wrap: wrap; gap: 6px; }
  .tags span { font-size: 10.5px; color: #64748b; background: #f1f5f9; padding: 2px 8px; border-radius: 999px; }
</style>
</head>
<body>
<h1>Infographic Slides 组件目录</h1>
<p class="sub">${comps.length} 个组件 · ${onlyDefault ? 1 : palettes.length} 套配色 · 每张图均可通过 <code>node scripts/render.mjs --tpl &lt;id&gt;</code> 复现</p>
<nav>${nav}</nav>
${sections}
<script>
document.querySelectorAll('.card').forEach((card) => {
  const sel = card.querySelector('select');
  if (!sel) return;
  sel.addEventListener('change', () => {
    card.querySelectorAll('.pane').forEach((p) => { p.hidden = p.dataset.i !== sel.value; });
  });
});
</script>
</body>
</html>`;

  writeFileSync(join(ROOT, 'catalog.html'), html);
  console.log(`✅ catalog.html: ${comps.length} 组件 × ${onlyDefault ? 1 : palettes.length} 配色 (${(html.length / 1024).toFixed(0)} KB)`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });

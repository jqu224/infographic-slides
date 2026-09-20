#!/usr/bin/env node
/**
 * render.mjs — 组件渲染 CLI
 * node scripts/render.mjs --tpl funnel-3d [--data path.json] [--palette bluegold] [--w 960] [--h 540] [--out output/x.svg] [--html]
 * 不给 --data 时使用组件的 data.example.json;--html 额外输出单文件 HTML 包装。
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { parseArgs } from 'node:util';
import { renderComponent } from '../library/index.js';

const { values: args } = parseArgs({
  options: {
    tpl: { type: 'string' },
    data: { type: 'string' },
    palette: { type: 'string', default: 'verdant' },
    w: { type: 'string', default: '960' },
    h: { type: 'string', default: '540' },
    out: { type: 'string' },
    html: { type: 'boolean' },
  },
});

async function main() {
  if (!args.tpl) {
    console.error('用法: node scripts/render.mjs --tpl <component-id> [--data file.json] [--palette id] [--out file.svg] [--html]');
    process.exit(1);
  }
  const data = args.data ? JSON.parse(readFileSync(args.data, 'utf-8')) : undefined;
  const w = Number(args.w) || 960, h = Number(args.h) || 540;
  const svg = await renderComponent(args.tpl, { data, paletteId: args.palette, w, h });

  const out = args.out ?? `output/${args.tpl}${args.palette !== 'verdant' ? '-' + args.palette : ''}.svg`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, svg);
  console.log(`✅ ${args.tpl} [${args.palette}] → ${out} (${(svg.length / 1024).toFixed(1)} KB)`);

  if (args.html) {
    const htmlOut = out.replace(/\.svg$/, '.html');
    writeFileSync(htmlOut, `<!DOCTYPE html>
<html lang="zh"><head><meta charset="utf-8"><title>${args.tpl}</title>
<style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#eef1f6}</style>
</head><body>${svg.replace(/width="\d+" height="\d+"/, 'width="100%" style="max-width:${args.w}px;height:auto"')}</body></html>`);
    console.log(`✅ html → ${htmlOut}`);
  }
}

main().catch((e) => { console.error('❌', e.message); process.exit(1); });

#!/usr/bin/env node
/** build-previews.mjs — 为每个组件生成 library/<id>/preview.svg(示例数据+默认配色) */
import { writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { listComponents, renderComponent, getPalettes } from '../library/index.js';

const LIB = join(dirname(dirname(fileURLToPath(import.meta.url))), 'library');

async function main() {
  const defaultPal = getPalettes()[0].id;
  for (const c of listComponents()) {
    const svg = await renderComponent(c.id, { paletteId: defaultPal });
    writeFileSync(join(LIB, c.id, 'preview.svg'), svg);
    console.log(`preview → library/${c.id}/preview.svg`);
  }
}

main().catch((e) => { console.error('❌', e); process.exit(1); });

#!/usr/bin/env node
/**
 * check.mjs — smoke: every component × every palette must render an <svg>
 * node scripts/check.mjs
 */
import { listComponents, renderComponent, getPalettes } from '../library/index.js';

async function main() {
  const comps = listComponents();
  const palettes = getPalettes();
  let ok = 0;
  const failures = [];

  for (const c of comps) {
    for (const p of palettes) {
      try {
        const svg = await renderComponent(c.id, { paletteId: p.id });
        if (typeof svg !== 'string' || !svg.trimStart().startsWith('<svg')) {
          failures.push(`${c.id}/${p.id}: output does not start with <svg`);
          continue;
        }
        ok += 1;
      } catch (e) {
        failures.push(`${c.id}/${p.id}: ${e.message}`);
      }
    }
  }

  const total = comps.length * palettes.length;
  if (failures.length) {
    console.error(`❌ check failed: ${ok}/${total}`);
    for (const f of failures) console.error('  -', f);
    process.exit(1);
  }
  console.log(`✅ check: ${ok}/${total} (components ${comps.length} × palettes ${palettes.length})`);
}

main().catch((e) => { console.error('❌', e); process.exit(1); });

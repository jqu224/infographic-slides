/**
 * library/index.js — 组件注册表与统一渲染入口
 *
 * 组件契约:
 *   library/<id>/template.js  → export function render({ data, palette, w, h, opts }) → svg string
 *   library/<id>/meta.json    → { id, name, label, category, tags, desc, params, example }
 *   library/<id>/data.example.json
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB_DIR = dirname(fileURLToPath(import.meta.url));
const ROOT = dirname(LIB_DIR);

/* ---------- palettes ---------- */

export function getPalettes() {
  return JSON.parse(readFileSync(join(ROOT, 'palettes/index.json'), 'utf-8'));
}

export function getPalette(id = 'aurora') {
  const list = getPalettes();
  return list.find((p) => p.id === id) ?? list[0];
}

/* ---------- components ---------- */

export function listComponents() {
  return readdirSync(LIB_DIR, { withFileTypes: true })
    .filter((d) => d.isDirectory() && d.name !== '_shared')
    .map((d) => {
      const dir = join(LIB_DIR, d.name);
      const metaPath = join(dir, 'meta.json');
      if (!existsSync(metaPath)) return null;
      try {
        const meta = JSON.parse(readFileSync(metaPath, 'utf-8'));
        return { ...meta, dir: d.name };
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .sort((a, b) => (a.category ?? '').localeCompare(b.category ?? '') || a.id.localeCompare(b.id));
}

/**
 * 渲染一个组件
 * @param {string} id 组件目录名,如 funnel-3d
 * @param {{ data?: object, paletteId?: string, palette?: object, w?: number, h?: number, opts?: object }} param0
 */
export async function renderComponent(id, { data, paletteId = 'aurora', palette, w = 960, h = 540, opts } = {}) {
  const dir = join(LIB_DIR, id);
  if (!existsSync(join(dir, 'template.js'))) throw new Error(`component not found: ${id}`);
  const mod = await import(join(dir, 'template.js'));
  const pal = palette ?? getPalette(paletteId);
  const d = data ?? JSON.parse(readFileSync(join(dir, 'data.example.json'), 'utf-8'));
  return mod.render({ data: d, palette: pal, w, h, opts: opts ?? {} });
}

export function exampleData(id) {
  return JSON.parse(readFileSync(join(LIB_DIR, id, 'data.example.json'), 'utf-8'));
}

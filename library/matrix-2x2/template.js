/**
 * matrix-2x2 — 2×2 四象限矩阵
 * 中心十字轴(带箭头)+ 四象限玻璃卡(各自主色),轴端标签
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const quads = (data.quadrants ?? data.items ?? data.quads ?? []).filter(Boolean).slice(0, 4);
  if (quads.length < 4) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['need 4 quadrants'] }) });

  const colors = S.seriesColors(palette, 4);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  defs.push(S.dropShadow({ id: 'm2sh', dy: 6, blur: 14, opacity: 0.14 }));

  const top = data.title ? 150 : 64;
  const zone = { x0: 96, x1: w - 96, y0: top + 14, y1: h - 58 };
  const cx = (zone.x0 + zone.x1) / 2, cy = (zone.y0 + zone.y1) / 2;
  const qw = (zone.x1 - zone.x0) / 2 - 12, qh = (zone.y1 - zone.y0) / 2 - 12;

  // 象限顺序:左上/右上/左下/右下
  const pos = [
    [cx - 12 - qw, cy - 12 - qh],
    [cx + 12, cy - 12 - qh],
    [cx - 12 - qw, cy + 12],
    [cx + 12, cy + 12],
  ];

  quads.forEach((q, i) => {
    const c = colors[i];
    const [x, y] = pos[i];
    const gc = S.glassCard({ x, y, w: qw, h: qh, rx: 16, color: c, id: `m2gc${i}`, filter: 'm2sh' });
    defs.push(gc.defs);
    body.push(gc.body);
    body.push(`<rect x="${S.r2(x + 18)}" y="${S.r2(y + 18)}" width="38" height="4.5" rx="2" fill="${c}"/>`);
    body.push(`<circle cx="${S.r2(x + qw - 42)}" cy="${S.r2(y + 44)}" r="20" fill="${S.alpha(c, 0.13)}"/>`);
    body.push(S.icon(q.icon, { x: x + qw - 52, y: y + 34, size: 20, color: c }));
    body.push(S.textEl({ x: x + 18, y: y + 52, size: 16.5, weight: 800, fill: palette.text, lines: [S.ellipsis(q.label, qw - 96, 16.5, { bold: true })] }));
    if (q.desc) body.push(S.textEl({ x: x + 18, y: y + 76, size: 11.5, fill: palette.subtext, lines: [S.ellipsis(q.desc, qw - 36, 11.5)] }));
    const items = (q.children ?? q.items ?? []).filter(Boolean).slice(0, 3);
    items.forEach((it, j) => {
      body.push(`<circle cx="${S.r2(x + 24)}" cy="${S.r2(y + qh - 24 - j * 24)}" r="3" fill="${c}"/>`);
      body.push(S.textEl({ x: x + 36, y: y + qh - 20 - j * 24, size: 11.5, weight: 500, fill: S.alpha(palette.text, 0.9), lines: [S.ellipsis(it.label ?? it, qw - 54, 11.5)] }));
    });
  });

  // 中心轴
  defs.push(S.arrowMarker('m2ax', S.alpha(palette.subtext, 0.7)));
  body.push(`<line x1="${cx}" y1="${S.r2(zone.y0 - 8)}" x2="${cx}" y2="${S.r2(zone.y1 + 8)}" stroke="${S.alpha(palette.subtext, 0.45)}" stroke-width="1.6" marker-end="url(#m2ax)" marker-start="url(#m2ax)"/>`);
  body.push(`<line x1="${S.r2(zone.x0 - 8)}" y1="${cy}" x2="${S.r2(zone.x1 + 8)}" y2="${cy}" stroke="${S.alpha(palette.subtext, 0.45)}" stroke-width="1.6" marker-end="url(#m2ax)" marker-start="url(#m2ax)"/>`);
  // 轴标签
  const ax = data.axis ?? {};
  body.push(S.textEl({ x: cx, y: zone.y0 - 14, size: 12, weight: 700, fill: palette.subtext, anchor: 'middle', lines: [ax.top ?? ''] }));
  body.push(S.textEl({ x: cx, y: zone.y1 + 26, size: 12, weight: 700, fill: palette.subtext, anchor: 'middle', lines: [ax.bottom ?? ''] }));
  body.push(S.textEl({ x: zone.x0 - 12, y: cy - 10, size: 12, weight: 700, fill: palette.subtext, anchor: 'end', lines: [ax.left ?? ''] }));
  body.push(S.textEl({ x: zone.x1 + 12, y: cy - 10, size: 12, weight: 700, fill: palette.subtext, anchor: 'start', lines: [ax.right ?? ''] }));

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

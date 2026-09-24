/**
 * donut-3d — 3D 环形占比图
 * 椭圆透视饼体,每片按数值不同厚度挤出,中心孔显示总量,引线标签
 */
import * as S from '../_shared/svg.mjs';

const K = 0.58; // 透视压扁系数

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const slicesIn = S.take(data.slices ?? data.items ?? data.parts, 6, 'slices');
  const n = slicesIn.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no slices'] }) });

  const total = slicesIn.reduce((s, x) => s + (Number(x.value) || 0), 0) || 1;
  const colors = S.seriesColors(palette, n);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  defs.push(S.dropShadow({ id: 'd3sh', dy: 8, blur: 16, opacity: 0.18 }));

  const cx = 340, cy = 320;
  const R = Math.min(170, (h - 200) / 2 + 30), r = R * 0.52;

  // 角度(从 -180 左侧开始顺时针)
  let ang = -180;
  const geoms = slicesIn.map((s, i) => {
    const v = Number(s.value) || 0;
    const a0 = ang, a1 = ang + (v / total) * 360;
    ang = a1;
    return { s, v, a0, a1, c: colors[i], hgt: 8 + Math.min(22, (v / total) * 34) };
  });

  const pt = (rad, aDeg) => {
    const a = (aDeg * Math.PI) / 180;
    return [cx + rad * Math.cos(a), cy + rad * K * Math.sin(a)];
  };
  const seg = (rad0, rad1, a0, a1, dy) => {
    const large = a1 - a0 > 180 ? 1 : 0;
    const [x0, y0] = pt(rad1, a0), [x1, y1] = pt(rad1, a1);
    const [x2, y2] = pt(rad0, a1), [x3, y3] = pt(rad0, a0);
    return `M${S.r2(x0)},${S.r2(y0 + dy)} A${S.r2(rad1)},${S.r2(rad1 * K)} 0 ${large} 1 ${S.r2(x1)},${S.r2(y1 + dy)} L${S.r2(x2)},${S.r2(y2 + dy)} A${S.r2(rad0)},${S.r2(rad0 * K)} 0 ${large} 0 ${S.r2(x3)},${S.r2(y3 + dy)} Z`;
  };
  // 只在"前半"(0..180,即画面下半)画外弧侧壁
  const sideWall = (g, dy) => {
    const a0 = Math.max(g.a0, 0), a1 = Math.min(g.a1, 180);
    if (a1 <= a0) return '';
    const [x0, y0] = pt(R, a0), [x1, y1] = pt(R, a1);
    return `M${S.r2(x0)},${S.r2(y0 + dy)} A${S.r2(R)},${S.r2(R * K)} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${S.r2(x1)},${S.r2(y1 + dy)} L${S.r2(x1)},${S.r2(y1)} A${S.r2(R)},${S.r2(R * K)} 0 ${a1 - a0 > 180 ? 1 : 0} 0 ${S.r2(x0)},${S.r2(y0)} Z`;
  };

  // 从后往前画(角度大的先画?按 y 排序:下半圆后画覆盖)
  const order = geoms.map((g, i) => i).sort((ia, ib) => {
    const midA = (g => (g.a0 + g.a1) / 2)(geoms[ib]) - (g => (g.a0 + g.a1) / 2)(geoms[ia]);
    return midA; // 上半圆(mid<0)先画
  });

  const pie = [];
  order.forEach((i) => {
    const g = geoms[i];
    // 侧壁
    const wall = sideWall(g, g.hgt);
    if (wall) pie.push(`<path d="${wall}" fill="${S.shade(g.c, -34)}" stroke="${S.alpha(S.shade(g.c, -40), 0.4)}" stroke-width="0.8"/>`);
    // 顶面
    pie.push(`<path d="${seg(r, R, g.a0, g.a1, 0)}" fill="${g.c}" stroke="${S.alpha(S.shade(g.c, -16), 0.55)}" stroke-width="1"/>`);
    // 内孔侧壁(下半可见)
    const inner = sideWall({ ...g, a0: Math.max(g.a0, 0), a1: Math.min(g.a1, 180) }, 0);
  });
  // 内孔
  pie.push(S.ellipse(cx, cy, r, r * K, { fill: S.shade(palette.bg, -4), stroke: palette.line, sw: 1 }));
  body.push(`<g filter="url(#d3sh)">${pie.join('\n')}</g>`);
  // 中心
  body.push(S.textEl({ x: cx, y: cy - 2, size: 26, weight: 800, fill: palette.text, anchor: 'middle', lines: [data.totalLabel ?? S.fmtNum(total)] }));
  body.push(S.textEl({ x: cx, y: cy + 22, size: 11.5, fill: palette.subtext, anchor: 'middle', lines: [data.totalDesc ?? '总计'] }));

  // 右侧图例/标签
  const lx = 580;
  const rowH = Math.min(56, (h - 190) / n);
  geoms.forEach((g, i) => {
    const y = 170 + i * rowH + rowH / 2;
    const pct = Math.round((g.v / total) * 1000) / 10;
    // 引线:从片外弧中点
    const mid = (g.a0 + g.a1) / 2;
    const [ex, ey] = pt(R + 10, mid);
    const horiz = ex < cx ? -1 : 1;
    body.push(`<line x1="${S.r2(ex)}" y1="${S.r2(ey)}" x2="${S.r2(cx + horiz * (R + 34))}" y2="${S.r2(y)}" stroke="${S.alpha(g.c, 0.5)}" stroke-width="1.3"/>`);
    body.push(`<line x1="${S.r2(cx + horiz * (R + 34))}" y1="${S.r2(y)}" x2="${S.r2(lx - 14)}" y2="${S.r2(y)}" stroke="${S.alpha(g.c, 0.5)}" stroke-width="1.3"/>`);
    body.push(`<rect x="${S.r2(lx - 6)}" y="${S.r2(y - 21)}" width="15" height="15" rx="4" fill="${g.c}"/>`);
    body.push(S.textEl({ x: lx + 20, y: y - 5, size: 14.5, weight: 700, fill: palette.text, lines: [S.ellipsis(g.s.label, w - lx - 130, 14.5, { bold: true })] }));
    if (g.s.desc) body.push(S.textEl({ x: lx + 20, y: y + 15, size: 11, fill: palette.subtext, lines: [S.ellipsis(g.s.desc, w - lx - 60, 11)] }));
    body.push(S.textEl({ x: w - 48, y: y + 1, size: 17, weight: 800, fill: g.c, anchor: 'end', lines: [`${pct}%`] }));
  });

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

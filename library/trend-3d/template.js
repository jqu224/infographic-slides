/**
 * trend-3d — 3D 趋势图(图表房间)
 * 三面体(背墙/右墙/透视地面)+ 平滑曲线 + 体积渐变面积 + 数据点辉光
 * 支持 1-2 条序列对比
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const rawSeries = S.take(data.series ?? [{ label: data.label ?? '', points: data.points ?? data.values ?? [] }], 2, 'series');
  const norm = rawSeries.map((sr) => ({
    label: sr.label ?? '',
    points: (sr.points ?? []).map((p, i) => (typeof p === 'object' ? { label: p.label ?? `P${i + 1}`, value: Number(p.value) || 0 } : { label: data.labels?.[i] ?? `P${i + 1}`, value: Number(p) || 0 })),
  })).filter((sr) => sr.points.length >= 2);
  const n = norm.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no series data'] }) });

  const colors = S.seriesColors(palette, n);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 320, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  /* ---- 图表房间 ---- */
  const px0 = 96, py0 = data.title ? 166 : 80, px1 = w - 88, py1 = h - 116;
  const D = 34, Dy = 14, DyF = 20; // 右墙/地面透视深度
  const plotW = px1 - px0, plotH = py1 - py0;

  // y 轴:第一序列用全局刻度;第二序列量级悬殊时用独立缩放(双轴思路)
  const allVals = norm.flatMap((s) => s.points.map((p) => p.value));
  const vMin = Math.min(0, ...allVals);
  const vMax = Math.max(...allVals) * 1.08 || 1;
  const m = Math.max(...norm.map((s) => s.points.length));
  const X = (i) => px0 + 26 + ((plotW - 52) * i) / Math.max(1, m - 1);
  const Y0 = (v) => py1 - (plotH * (v - vMin)) / (vMax - vMin);
  let Y1 = Y0;
  if (n === 2) {
    const vs2 = norm[1].points.map((p) => p.value);
    const lo = Math.min(...vs2) * 0.8, hi = Math.max(...vs2) * 1.18;
    Y1 = (v) => py1 - (plotH * (v - lo)) / (hi - lo);
  }
  const Y = (si) => (si === 0 ? Y0 : Y1);

  // 地面(透视平行四边形)+ 网格
  body.push(`<path d="M${px0},${py1} L${px1},${py1} L${S.r2(px1 + D)},${S.r2(py1 + DyF)} L${S.r2(px0 + D)},${S.r2(py1 + DyF)} Z" fill="#ffffff" fill-opacity="0.5" stroke="${palette.line}" stroke-width="1"/>`);
  for (let i = 0; i < m; i++) {
    body.push(`<line x1="${S.r2(X(i))}" y1="${py1}" x2="${S.r2(X(i) + D)}" y2="${S.r2(py1 + DyF)}" stroke="${S.alpha(palette.subtext, 0.18)}" stroke-width="1"/>`);
  }
  // 右墙
  body.push(`<path d="M${px1},${py0} L${S.r2(px1 + D)},${S.r2(py0 - Dy)} L${S.r2(px1 + D)},${S.r2(py1 - Dy)} L${px1},${py1} Z" fill="${S.alpha(palette.subtext, 0.09)}" stroke="${palette.line}" stroke-width="1"/>`);
  // 背墙
  body.push(`<rect x="${px0}" y="${py0}" width="${plotW}" height="${plotH}" fill="#ffffff" fill-opacity="0.55" stroke="none"/>`);
  defs.push(S.dropShadow({ id: 't3sh', dy: 5, blur: 12, opacity: 0.15 }));

  // 背墙网格 + y 轴刻度
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const v = vMin + ((vMax - vMin) * t) / ticks;
    const y = Y(v);
    body.push(`<line x1="${px0}" y1="${S.r2(y)}" x2="${px1}" y2="${S.r2(y)}" stroke="${S.alpha(palette.subtext, t === 0 ? 0.5 : 0.16)}" stroke-width="${t === 0 ? 1.5 : 1}"${t === 0 ? '' : ' stroke-dasharray="2 4"'}/>`);
    body.push(S.textEl({ x: px0 - 10, y: y + 4, size: 12, weight: 500, fill: S.alpha(palette.subtext, 0.95), anchor: 'end', lines: [S.fmtNum(Math.round(v * 10) / 10)] }));
  }
  for (let i = 0; i < m; i++) {
    body.push(`<line x1="${S.r2(X(i))}" y1="${py0}" x2="${S.r2(X(i))}" y2="${py1}" stroke="${S.alpha(palette.subtext, 0.1)}" stroke-width="1"/>`);
  }

  /* ---- 序列 ---- */
  norm.forEach((sr, si) => {
    const c = colors[si];
    const Ys = Y(si);
    const pts = sr.points.map((p, i) => [X(i), Ys(p.value)]);
    const line = S.smoothPath(pts);
    // 面积(第一序列填满,第二序列半透明)
    if (si === 0) {
      defs.push(S.linearGradient({ id: `t3a${si}`, stops: [[0, S.alpha(S.shade(c, 14), 0.36)], [1, S.alpha(c, 0.02)]] }));
      body.push(`<path d="${line} L${S.r2(pts[pts.length - 1][0])},${py1} L${S.r2(pts[0][0])},${py1} Z" fill="url(#t3a${si})"/>`);
    }
    body.push(`<path d="${line}" fill="none" stroke="${si === 0 ? c : S.shade(c, -18)}" stroke-width="${si === 0 ? 4 : 3}" stroke-linecap="round"${si === 1 ? ' stroke-dasharray="8 5"' : ''} filter="url(#t3sh)"/>`);
    // 数据点
    sr.points.forEach((p, i) => {
      const [x, y] = pts[i];
      if (si === 0) {
        body.push(`<circle cx="${S.r2(x)}" cy="${S.r2(y)}" r="8" fill="${S.alpha(c, 0.18)}"/><circle cx="${S.r2(x)}" cy="${S.r2(y)}" r="4.5" fill="${c}" stroke="#ffffff" stroke-width="2"/>`);
      } else {
        body.push(`<circle cx="${S.r2(x)}" cy="${S.r2(y)}" r="3.6" fill="#ffffff" stroke="${c}" stroke-width="2.2"/>`);
      }
    });
    // 数值标注(点数 ≤ 8 时全标,否则只标首尾峰)
    const idx = sr.points.length <= 8 ? sr.points.map((_, i) => i) : [0, sr.points.length - 1, sr.points.reduce((bi, p, i, a) => (p.value > a[bi].value ? i : bi), 0)];
    [...new Set(idx)].forEach((i) => {
      const [x, y] = pts[i];
      body.push(S.textEl({ x, y: y - 12, size: 12.5, weight: 800, fill: S.shade(c, si === 0 ? -12 : 6), anchor: 'middle', lines: [S.fmtNum(sr.points[i].value)] }));
    });
  });

  // x 轴标签(沿地面前沿)
  norm[0].points.forEach((p, i) => {
    body.push(S.textEl({ x: S.r2(X(i) + D / 2), y: py1 + DyF + 20, size: 11.5, fill: palette.subtext, anchor: 'middle', lines: [S.ellipsis(p.label, 64, 11.5)] }));
  });

  /* ---- 图例(右上) ---- */
  let lx = w - 88;
  const ly = data.title ? 76 : 40;
  for (let si = n - 1; si >= 0; si--) {
    const c = colors[si];
    const label = norm[si].label || `S${si + 1}`;
    const tw = S.textWidth(label, 12.5) + 46;
    lx -= tw;
    body.push(`<line x1="${S.r2(lx)}" y1="${ly}" x2="${S.r2(lx + 22)}" y2="${ly}" stroke="${c}" stroke-width="3.5" stroke-linecap="round"${si === 1 ? ' stroke-dasharray="6 4"' : ''}/><circle cx="${S.r2(lx + 11)}" cy="${ly}" r="3.5" fill="#ffffff" stroke="${c}" stroke-width="2"/>`);
    body.push(S.textEl({ x: lx + 28, y: ly + 4.5, size: 12.5, weight: 600, fill: palette.text, lines: [label] }));
  }

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

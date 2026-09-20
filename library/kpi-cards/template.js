/**
 * kpi-cards — KPI 指标卡矩阵
 * 玻璃渐变边框卡片:大数字 + 同比箭头 + 迷你趋势线 + 图标徽章
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const kpis = (data.kpis ?? data.items ?? data.cards ?? []).filter(Boolean).slice(0, 6);
  const n = kpis.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no kpis'] }) });

  const colors = S.seriesColors(palette, n);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  defs.push(S.dropShadow({ id: 'ksh', dy: 7, blur: 16, opacity: 0.14 }));

  const cols = n <= 4 ? n : 3;
  const rows = Math.ceil(n / cols);
  const pad = 48, gx = 22, gy = 22;
  const cw = (w - pad * 2 - gx * (cols - 1)) / cols;
  const ch = Math.min(168, (h - 190 - gy * (rows - 1)) / rows);
  const gridTop = h - 52 - rows * ch - gy * (rows - 1);

  kpis.forEach((k, i) => {
    const c = colors[i];
    const col = i % cols, row = Math.floor(i / cols);
    const x = pad + col * (cw + gx);
    const y = gridTop + row * (ch + gy);
    const gc = S.glassCard({ x, y, w: cw, h: ch, rx: 16, color: c, id: `kgc${i}`, filter: 'ksh' });
    defs.push(gc.defs);
    body.push(gc.body);
    // 顶部色条
    defs.push(S.linearGradient({ id: `kbar${i}`, stops: [[0, c], [1, S.alpha(c, 0.05)]] }));
    body.push(`<rect x="${S.r2(x + 16)}" y="${S.r2(y + 14)}" width="44" height="5" rx="2.5" fill="url(#kbar${i})"/>`);
    // 图标徽章
    body.push(`<circle cx="${S.r2(x + cw - 44)}" cy="${S.r2(y + 40)}" r="21" fill="${S.alpha(c, 0.13)}"/>`);
    body.push(S.icon(k.icon, { x: x + cw - 54, y: y + 30, size: 20, color: c }));
    // 大数字
    const num = k.valueLabel ?? S.fmtNum(Number(k.value) || 0, { unit: k.unit ?? '' });
    const numSize = S.fitSize(num, cw - 60, 40, { min: 22, bold: true });
    body.push(S.textEl({ x: x + 16, y: y + ch * 0.52, size: numSize, weight: 800, fill: palette.text, lines: [num] }));
    // 标签
    body.push(S.textEl({ x: x + 16, y: y + ch * 0.52 + 26, size: 13, weight: 600, fill: palette.subtext, lines: [S.ellipsis(k.label, cw - 32, 13, { bold: true })] }));
    // 同比
    if (k.delta != null && k.delta !== '') {
      const d = Number(k.delta);
      const up = d >= 0;
      const dc = up ? '#16a34a' : '#dc2626';
      body.push(`<rect x="${S.r2(x + 16)}" y="${S.r2(y + ch - 34)}" width="${S.r2(Math.max(72, S.textWidth(`↑ ${Math.abs(d)}%`, 11.5, { bold: true }) + 20))}" height="22" rx="11" fill="${S.alpha(dc, 0.12)}"/>`);
      body.push(S.textEl({ x: x + 26, y: y + ch - 18.5, size: 11.5, weight: 800, fill: dc, lines: [`${up ? '↑' : '↓'} ${Math.abs(d)}%${k.deltaLabel ?? ''}`] }));
    }
    // 迷你趋势线
    const spark = (k.spark ?? k.trend ?? []).map(Number).filter((v) => isFinite(v));
    if (spark.length >= 3) {
      const sw = cw - 32, sh = 30;
      const sx0 = x + cw - 16 - sw, sy0 = y + ch - 36;
      const mn = Math.min(...spark), mx = Math.max(...spark);
      const pts = spark.map((v, j) => [sx0 + (sw * j) / (spark.length - 1), sy0 + sh - ((v - mn) / (mx - mn || 1)) * sh]);
      defs.push(S.linearGradient({ id: `ksp${i}`, stops: [[0, S.alpha(c, 0.25)], [1, S.alpha(c, 0)]] }));
      body.push(`<path d="${S.smoothPath(pts)} L${S.r2(pts[pts.length - 1][0])},${S.r2(sy0 + sh)} L${S.r2(pts[0][0])},${S.r2(sy0 + sh)} Z" fill="url(#ksp${i})"/>`);
      body.push(`<path d="${S.smoothPath(pts)}" fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round"/>`);
      body.push(`<circle cx="${S.r2(pts[pts.length - 1][0])}" cy="${S.r2(pts[pts.length - 1][1])}" r="3" fill="${c}"/>`);
    }
  });

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

/**
 * pyramid-3d — 3D 分层金字塔
 * 每层左右分面(左受光/右背光)+ 顶沿石板 + 地面投影,左编号徽章、右引线标签
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const layers = S.take(data.layers ?? data.stages ?? data.items, 6, 'layers');
  const n = layers.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no layers data'] }) });

  const colors = S.seriesColors(palette, n);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.07 }));

  /* ---- 金字塔本体 ---- */
  const cx = opts.cx ?? 290;
  const top = data.title ? 150 : 66;
  const wBase = Math.min(360, w * 0.38);
  const lh = Math.max(46, Math.min(78, Math.floor((h - top - 90) / n)));
  const dx = 16, dy = 9;

  const layerY = (i) => top + i * lh;
  const B = (k) => (wBase * k) / n; // 第 k 条分界线宽度(k=0 顶部尖端,k=n 底边)

  defs.push(S.dropShadow({ id: 'p3sh', dy: 8, blur: 18, opacity: 0.2 }));

  // 地面投影
  body.push(S.ellipse(cx, layerY(n) + 6, wBase / 2 + 20, Math.max(8, lh * 0.13), { fill: S.alpha('#0f172a', 0.14) }));

  const pyr = [];
  for (let i = n - 1; i >= 0; i--) {
    const yT = layerY(i), yB = layerY(i + 1);
    const wt = B(i), wb = B(i + 1);
    const c = colors[i];
    // 前面:左受光 → 高光 → 右微暗
    defs.push(S.linearGradient({ id: `p3f${i}`, x1: 0, y1: 0, x2: 1, y2: 0, stops: [[0, S.shade(c, -8)], [0.32, S.shade(c, 16)], [1, S.shade(c, -12)]] }));
    const stroke = S.alpha(S.shade(c, -18), 0.4);
    // 右侧拉伸面(沿斜边,构成体积)
    pyr.push(`<path d="M${S.r2(cx + wt / 2)},${S.r2(yT)} L${S.r2(cx + wt / 2 + dx)},${S.r2(yT - dy)} L${S.r2(cx + wb / 2 + dx)},${S.r2(yB - dy)} L${S.r2(cx + wb / 2)},${S.r2(yB)} Z" fill="${S.shade(c, -28)}" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>`);
    // 前面
    pyr.push(`<path d="M${S.r2(cx - wt / 2)},${S.r2(yT)} L${S.r2(cx + wt / 2)},${S.r2(yT)} L${S.r2(cx + wb / 2)},${S.r2(yB)} L${S.r2(cx - wb / 2)},${S.r2(yB)} Z" fill="url(#p3f${i})" stroke="${stroke}" stroke-width="1" stroke-linejoin="round"/>`);
    // 顶沿石板
    if (i > 0) {
      pyr.push(`<path d="M${S.r2(cx - wt / 2)},${S.r2(yT)} L${S.r2(cx + wt / 2)},${S.r2(yT)} L${S.r2(cx + wt / 2 + dx)},${S.r2(yT - dy)} L${S.r2(cx - wt / 2 + dx)},${S.r2(yT - dy)} Z" fill="${S.shade(c, 36)}" stroke="${S.alpha(S.shade(c, 4), 0.45)}" stroke-width="1" stroke-linejoin="round"/>`);
    }
    // 落在下一层顶面的接缝阴影
    if (i < n - 1) {
      pyr.push(`<path d="M${S.r2(cx - wb / 2)},${S.r2(yB)} L${S.r2(cx + wb / 2)},${S.r2(yB)} L${S.r2(cx + wb / 2 - 6)},${S.r2(yB + 5)} L${S.r2(cx - wb / 2 + 6)},${S.r2(yB + 5)} Z" fill="${S.alpha('#0f172a', 0.16)}"/>`);
    }
    // 塔尖
    if (i === 0) {
      pyr.push(`<circle cx="${S.r2(cx + dx / 2)}" cy="${S.r2(yT - dy - 3)}" r="5" fill="${S.shade(c, 32)}" stroke="${S.alpha(S.shade(c, -10), 0.4)}"/>`);
    }
  }
  body.push(`<g filter="url(#p3sh)">${pyr.join('\n')}</g>`);

  /* ---- 标签 ---- */
  const lx = Math.max(cx + wBase / 2 + 60, 580);
  const colW = w - lx - 44;
  for (let i = 0; i < n; i++) {
    const it = layers[i];
    const yMid = layerY(i) + lh / 2 + (i === 0 ? 6 : 0);
    const c = colors[i];
    const wm = (B(i) + B(i + 1)) / 2; // 层中宽,徽章锚点
    // 左编号徽章
    body.push(`<circle cx="${S.r2(cx - wm / 2 - 26)}" cy="${S.r2(yMid)}" r="14" fill="#ffffff" stroke="${c}" stroke-width="2"/>`);
    body.push(S.textEl({ x: cx - wm / 2 - 26, y: yMid + 4.5, size: 13, weight: 800, fill: c, anchor: 'middle', lines: [String(i + 1)] }));
    // 引线
    body.push(`<line x1="${S.r2(cx + wm / 2 - 2)}" y1="${S.r2(yMid)}" x2="${S.r2(lx - 28)}" y2="${S.r2(yMid)}" stroke="${S.alpha(palette.subtext, 0.4)}" stroke-width="1.3" stroke-dasharray="3 3"/><circle cx="${S.r2(lx - 28)}" cy="${S.r2(yMid)}" r="3" fill="${c}"/>`);
    // 图标
    if (it.icon) {
      body.push(`<circle cx="${S.r2(lx + 4)}" cy="${S.r2(yMid)}" r="17" fill="${S.alpha(c, 0.13)}"/>`);
      body.push(S.icon(it.icon, { x: lx - 4, y: yMid - 8.5, size: 17, color: c }));
    }
    const tx = lx + (it.icon ? 32 : 4);
    body.push(S.textEl({ x: tx, y: yMid - 3, size: 15, weight: 700, fill: palette.text, lines: [S.ellipsis(it.label, colW - 60, 15, { bold: true })] }));
    body.push(S.textEl({ x: tx, y: yMid + 17, size: 11.5, fill: palette.subtext, lines: [S.ellipsis(it.desc ?? '', colW - 24, 11.5)] }));
    if (it.value != null && it.value !== '') {
      body.push(S.textEl({ x: w - 44, y: yMid + 3, size: 15, weight: 800, fill: c, anchor: 'end', lines: [it.valueLabel ?? S.fmtNum(Number(it.value) || 0, { unit: it.unit ?? '' })] }));
    }
  }

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

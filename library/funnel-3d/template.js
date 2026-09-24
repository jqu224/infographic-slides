/**
 * funnel-3d — 3D 多层漏斗
 * 多色渐变分层 + 椭圆顶面体积感 + 右侧转化链路(箭头 + 流失率)
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const stages = S.take(data.stages ?? data.items, 6, 'stages');
  const n = stages.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no stages data'] }) });

  const colors = S.seriesColors(palette, n);
  const vals = stages.map((s) => Number(s.value) || 0);
  const v0 = Math.max(...vals, 1);

  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors));

  /* ---- 漏斗本体(自底向上绘制,上层覆盖接缝,轮廓连续) ---- */
  const cx = opts.cx ?? 300;
  const top = data.title ? 152 : 64;
  const lh = Math.max(38, Math.min(68, Math.floor((h - top - 64) / n)));
  const gap = 0;
  const wMax = Math.min(390, w * 0.4);
  const wMin = wMax * 0.34;
  const ry = Math.min(14, lh * 0.24);

  const widths = stages.map((s) => {
    const ratio = Math.min(1, Math.max(0.1, (Number(s.value) || 0) / v0));
    return wMin + (wMax - wMin) * Math.pow(ratio, 0.9);
  });
  for (let i = 1; i < n; i++) widths[i] = Math.min(widths[i], widths[i - 1] - 10);

  const layerY = (i) => top + i * lh;
  const layerW = (i) => {
    const wt = widths[i];
    const wb = i < n - 1 ? widths[i + 1] : Math.max(wMin * 0.72, wt - 30);
    return { wt, wb };
  };

  defs.push(S.dropShadow({ id: 'f3sh', dy: 7, blur: 16, opacity: 0.18 }));
  // 圆柱明暗:左高光右阴影(共享 overlay 渐变)
  defs.push(S.linearGradient({
    id: 'f3cyl', x1: 0, y1: 0, x2: 1, y2: 0,
    stops: [[0, '#ffffff'], [0.22, '#ffffff'], [0.55, '#ffffff'], [1, '#0f172a']],
  }));
  const funnel = [];
  for (let i = n - 1; i >= 0; i--) {
    const y = layerY(i);
    const { wt, wb } = layerW(i);
    const c = colors[i];
    const front = `M${S.r2(cx - wt / 2)},${S.r2(y)} L${S.r2(cx + wt / 2)},${S.r2(y)} L${S.r2(cx + wb / 2)},${S.r2(y + lh)} L${S.r2(cx - wb / 2)},${S.r2(y + lh)} Z`;
    defs.push(S.volGradient(`f3v${i}`, c, { top: 20, bottom: -18 }));
    funnel.push(`<path d="${front}" fill="url(#f3v${i})" stroke="${S.alpha(S.shade(c, -18), 0.5)}" stroke-width="1"/>`);
    funnel.push(`<path d="${front}" fill="url(#f3cyl)" opacity="0.16"/>`);
    funnel.push(S.ellipse(cx, y, wt / 2, ry, { fill: S.shade(c, 36), stroke: S.alpha(S.shade(c, -6), 0.4), sw: 1 }));
    const pct = Math.round((vals[i] / v0) * 100);
    funnel.push(S.textEl({ x: cx, y: y + lh / 2 + 5, size: Math.min(15, lh * 0.3), weight: 700, fill: '#ffffff', anchor: 'middle', lines: [`${pct}%`] }));
  }
  body.push(`<g filter="url(#f3sh)">${funnel.join('\n')}</g>`);
  // 地面投影(落地感)
  const lastWb = layerW(n - 1).wb;
  body.push(`<ellipse cx="${S.r2(cx)}" cy="${S.r2(layerY(n - 1) + lh + 6)}" rx="${S.r2(lastWb / 2 + 26)}" ry="${S.r2(Math.max(8, ry * 0.8))}" fill="${S.alpha('#0f172a', 0.1)}"/>`);

  /* ---- 总体转化胶囊 ---- */
  const overall = Math.round((vals[n - 1] / v0) * 100);
  const cy0 = layerY(n - 1) + lh + 16;
  defs.push(S.linearGradient({ id: 'f3pill', stops: [[0, S.shade(palette.accent, 18)], [1, S.shade(palette.accent, -12)]] }));
  body.push(`<g filter="url(#f3sh)"><rect x="${S.r2(cx - wMax / 2)}" y="${S.r2(cy0)}" width="${S.r2(wMax)}" height="36" rx="18" fill="#ffffff" fill-opacity="0.92" stroke="${palette.line}"/></g>`);
  body.push(S.textEl({ x: cx - wMax / 2 + 20, y: cy0 + 23.5, size: 13, weight: 700, fill: palette.text, lines: ['整体转化率'] }));
  body.push(S.textEl({ x: cx + wMax / 2 - 20, y: cy0 + 24.5, size: 17, weight: 800, fill: palette.accent, anchor: 'end', lines: [`${overall}%`] }));

  /* ---- 右侧链路(行距拉通到胶囊底,两栏底部对齐) ---- */
  const rx0 = Math.max(cx + wMax / 2 + 70, 560);
  const colW = w - rx0 - 40;
  const totalH = n * lh + 52;
  const rowH = totalH / n;
  for (let i = 0; i < n; i++) {
    const s = stages[i];
    const y = top + i * rowH + rowH / 2;
    const layerCy = layerY(i) + lh / 2;
    const c = colors[i];
    const { wt, wb } = layerW(i);
    // 连接线:漏斗层侧边中点 → 行图标
    const edgeMid = cx + (wt + wb) / 4;
    body.push(`<line x1="${S.r2(edgeMid + 8)}" y1="${S.r2(layerCy)}" x2="${S.r2(rx0 - 32)}" y2="${S.r2(y)}" stroke="${S.alpha(palette.subtext, 0.4)}" stroke-width="1.3" stroke-dasharray="3 3"/><circle cx="${S.r2(rx0 - 32)}" cy="${S.r2(y)}" r="3" fill="${c}"/>`);
    // 图标
    body.push(`<circle cx="${S.r2(rx0 + 6)}" cy="${S.r2(y)}" r="18" fill="${S.alpha(c, 0.13)}"/>`);
    body.push(S.icon(s.icon, { x: rx0 - 3, y: y - 9, size: 18, color: c }));
    // 文本
    const tx = rx0 + 34;
    body.push(S.textEl({ x: tx, y: y - 3, size: 15, weight: 700, fill: palette.text, lines: [S.ellipsis(s.label, colW - 70, 15, { bold: true })] }));
    const valTxt = s.valueLabel ?? S.fmtNum(vals[i], { unit: s.unit ?? '' });
    body.push(S.textEl({ x: tx, y: y + 17, size: 12.5, fill: palette.subtext, lines: [S.ellipsis(s.desc ?? valTxt, colW - 40, 12.5)] }));
    body.push(S.textEl({ x: w - 44, y: y + 2, size: 16, weight: 800, fill: c, anchor: 'end', lines: [valTxt] }));
    // 流转率
    if (i < n - 1 && vals[i] > 0) {
      const pass = Math.round((vals[i + 1] / vals[i]) * 100);
      const y1 = y + 14;
      const y2 = top + (i + 1) * rowH + rowH / 2 - 14;
      if (y2 - y1 > 16) {
        body.push(`<line x1="${S.r2(rx0 + 4)}" y1="${S.r2(y1)}" x2="${S.r2(rx0 + 4)}" y2="${S.r2(y2)}" stroke="${S.alpha(palette.subtext, 0.55)}" stroke-width="1.5" marker-end="url(#f3arr)"/>`);
        body.push(S.textEl({ x: rx0 + 14, y: (y1 + y2) / 2 + 4, size: 11.5, weight: 600, fill: palette.subtext, lines: [`${pass}%`] }));
      }
    }
  }
  defs.push(S.arrowMarker('f3arr', S.alpha(palette.subtext, 0.8)));

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

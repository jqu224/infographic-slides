/**
 * timeline-3d — 3D 立体时间轴
 * 立体轴身(box3d)贯穿画面,里程碑节点上下交替,玻璃卡片 + 日期胶囊
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const events = (data.events ?? data.items ?? data.milestones ?? []).filter(Boolean).slice(0, 7);
  const n = events.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no events'] }) });

  const colors = S.seriesColors(palette, n);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  defs.push(S.dropShadow({ id: 'tlsh', dy: 5, blur: 12, opacity: 0.16 }));

  const barY = h / 2 + 34;
  const x0 = 96, x1 = w - 96;
  const X = (i) => x0 + ((x1 - x0) * i) / (n - 1 || 1);

  // 轴身(渐变立体条)
  defs.push(S.linearGradient({ id: 'tlbar', stops: colors.flatMap((c, i) => [[i / n, c], [(i + 1) / n, S.shade(c, -14)]]) }));
  const bh = 20;
  body.push(`<g filter="url(#tlsh)">
<path d="M${x0},${S.r2(barY - bh / 2 - 8)} L${x1},${S.r2(barY - bh / 2 - 8)} L${x1},${S.r2(barY + bh / 2 - 8)} L${x0},${S.r2(barY + bh / 2)} Z" fill="${S.alpha(palette.text, 0.2)}"/>
<rect x="${x0}" y="${S.r2(barY - bh / 2)}" width="${x1 - x0}" height="${bh}" rx="${bh / 2}" fill="url(#tlbar)"/>
</g>`);

  events.forEach((ev, i) => {
    const x = X(i);
    const c = colors[i];
    const up = i % 2 === 0;
    const cardH = 92, cardW = Math.min(190, (x1 - x0) / n - 10);
    // 节点
    body.push(`<g filter="url(#tlsh)"><circle cx="${S.r2(x)}" cy="${S.r2(barY)}" r="15" fill="#ffffff" stroke="${c}" stroke-width="3.5"/></g>`);
    body.push(S.icon(ev.icon, { x: x - 8, y: barY - 8, size: 16, color: c }));
    // 茎
    const stemTop = up ? barY - 46 : barY + 46;
    body.push(`<line x1="${S.r2(x)}" y1="${S.r2(up ? barY - 15 : barY + 15)}" x2="${S.r2(x)}" y2="${S.r2(up ? stemTop + cardH : stemTop - 0)}" stroke="${S.alpha(c, 0.55)}" stroke-width="2" stroke-dasharray="4 3"/>`);
    // 卡片
    const cy0 = up ? stemTop + cardH - 62 : stemTop;
    const cx0 = Math.max(30, Math.min(w - 30 - cardW, x - cardW / 2));
    const gc = S.glassCard({ x: cx0, y: cy0, w: cardW, h: cardH - 26, rx: 12, color: c, id: `tlgc${i}`, filter: 'tlsh' });
    defs.push(gc.defs);
    body.push(gc.body);
    // 日期胶囊
    const dw = Math.max(58, S.textWidth(ev.date ?? ev.label ?? '', 11.5, { bold: true }) + 20);
    body.push(`<rect x="${S.r2(x - dw / 2)}" y="${S.r2(up ? cy0 - 11 : cy0 + cardH - 26 + 11 - 22)}" width="${S.r2(dw)}" height="22" rx="11" fill="${c}"/>`);
    body.push(S.textEl({ x, y: (up ? cy0 - 11 : cy0 + cardH - 26 + 11 - 22) + 15, size: 11.5, weight: 700, fill: '#ffffff', anchor: 'middle', lines: [S.ellipsis(ev.date ?? '', dw - 12, 11.5, { bold: true })] }));
    // 文本
    body.push(S.textEl({ x: cx0 + 14, y: cy0 + 26, size: 14, weight: 700, fill: palette.text, lines: [S.ellipsis(ev.label, cardW - 28, 14, { bold: true })] }));
    body.push(S.textEl({ x: cx0 + 14, y: cy0 + 46, size: 11, fill: palette.subtext, lines: [S.ellipsis(ev.desc ?? '', cardW - 24, 11)] }));
  });

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

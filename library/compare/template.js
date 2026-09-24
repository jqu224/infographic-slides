/**
 * compare — 双方 VS 对比图
 * 左右玻璃面板(各自渐变页头)+ 中心 VS 徽章 + 逐条对比行,可选结论条
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const sides = S.take(data.sides ?? data.compares, 2, 'sides');
  if (sides.length < 2) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['need 2 sides'] }) });

  const [A, B] = sides;
  const colors = S.seriesColors(palette, 2);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.07 }));

  defs.push(S.dropShadow({ id: 'cpsh', dy: 8, blur: 18, opacity: 0.16 }));

  const top = data.title ? 148 : 60;
  const panelW = (w - 48 * 2 - 90) / 2;
  const panelH = (data.verdict ? h - top - 92 : h - top - 56);
  const panels = [
    { side: A, c: colors[0], x: 48 },
    { side: B, c: colors[1], x: 48 + panelW + 90 },
  ];

  panels.forEach(({ side, c, x }, pi) => {
    const gc = S.glassCard({ x, y: top, w: panelW, h: panelH, rx: 18, color: c, id: `cpgc${pi}`, filter: 'cpsh' });
    defs.push(gc.defs);
    body.push(gc.body);
    // 页头渐变条
    defs.push(S.linearGradient({ id: `cph${pi}`, x1: 0, y1: 0, x2: 1, y2: 0, stops: [[0, c], [1, S.shade(c, -18)]] }));
    body.push(`<rect x="${S.r2(x)}" y="${S.r2(top)}" width="${S.r2(panelW)}" height="64" rx="18" fill="url(#cph${pi})"/><rect x="${S.r2(x)}" y="${S.r2(top + 40)}" width="${S.r2(panelW)}" height="24" fill="url(#cph${pi})"/>`);
    body.push(`<circle cx="${S.r2(x + 36)}" cy="${S.r2(top + 32)}" r="19" fill="${S.alpha('#ffffff', 0.25)}"/>`);
    body.push(S.icon(side.icon, { x: x + 27, y: top + 23, size: 19, color: '#ffffff' }));
    body.push(S.textEl({ x: x + 66, y: top + 30, size: 18, weight: 800, fill: '#ffffff', lines: [S.ellipsis(side.label ?? (pi ? 'B 方案' : 'A 方案'), panelW - 90, 18, { bold: true })] }));
    body.push(S.textEl({ x: x + 66, y: top + 50, size: 11, fill: S.alpha('#ffffff', 0.85), lines: [S.ellipsis(side.desc ?? '', panelW - 84, 11)] }));
    // 对比行
    const rows = S.take(side.children ?? side.points ?? side.items, 5, 'side.points');
    const rowTop = top + 88;
    const rowH = Math.min(44, (panelH - 96) / Math.max(1, rows.length));
    rows.forEach((r, i) => {
      const y = rowTop + i * rowH;
      const good = r.positive !== false && r.pro !== false;
      const ic = good ? 'check' : (r.icon ?? 'close');
      body.push(`<circle cx="${S.r2(x + 34)}" cy="${S.r2(y + rowH / 2)}" r="12" fill="${S.alpha(good ? c : palette.subtext, 0.14)}"/>`);
      body.push(S.icon(ic === 'close' ? 'cycle' : ic, { x: x + 27, y: y + rowH / 2 - 6, size: 12, color: good ? c : palette.subtext }));
      body.push(S.textEl({ x: x + 56, y: y + rowH / 2 - 4, size: 13, weight: 600, fill: palette.text, lines: [S.ellipsis(r.label ?? r, panelW - 76, 13, { bold: true })] }));
      if (r.desc) body.push(S.textEl({ x: x + 56, y: y + rowH / 2 + 14, size: 10.5, fill: palette.subtext, lines: [S.ellipsis(r.desc, panelW - 72, 10.5)] }));
    });
  });

  // 中心 VS 徽章
  const vcx = w / 2, vcy = top + panelH / 2;
  defs.push(S.radialGradient({ id: 'cpvs', stops: [[0, S.shade(palette.accent, 26)], [1, S.shade(palette.accent, -14)]] }));
  body.push(`<g filter="url(#cpsh)">
<circle cx="${vcx}" cy="${S.r2(vcy)}" r="44" fill="url(#cpvs)"/>
<circle cx="${vcx}" cy="${S.r2(vcy)}" r="44" fill="none" stroke="${S.alpha('#ffffff', 0.55)}" stroke-width="2.5"/>
${S.textEl({ x: vcx, y: vcy + 9, size: 27, weight: 900, fill: '#ffffff', anchor: 'middle', lines: ['VS'], letterSpacing: '1' })}
</g>`);

  // 结论条
  if (data.verdict) {
    const vy = top + panelH + 18;
    const vw = w - 96;
    body.push(`<rect x="48" y="${S.r2(vy)}" width="${S.r2(vw)}" height="42" rx="21" fill="${S.alpha(palette.accent, 0.1)}" stroke="${S.alpha(palette.accent, 0.45)}" stroke-width="1.2"/>`);
    body.push(S.icon('bulb', { x: 66, y: vy + 12, size: 18, color: palette.accent }));
    body.push(S.textEl({ x: 94, y: vy + 26.5, size: 13, weight: 600, fill: palette.text, lines: [S.ellipsis(data.verdict, vw - 60, 13, { bold: true })] }));
  }

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

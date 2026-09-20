/**
 * people-ratio — 人物象形占比图
 * 左侧大百分比 + 说明,右侧 10/20 人形网格(填充=占比),支持两组对比
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const groups = (data.groups ?? [{ label: data.label ?? '', value: Number(data.value) || 0, desc: data.desc }]).filter((g) => g && g.value != null).slice(0, 2);
  const n = groups.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['need value/groups'] }) });

  const colors = S.seriesColors(palette, n + 1);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  const top = data.title ? 160 : 76;
  const total = Number(data.totalIcons ?? 10);
  const perRow = total > 10 ? 10 : total;

  // 左侧大数字区
  if (n === 1) {
    const g = groups[0];
    const c = colors[0];
    const pct = Math.round(Math.min(1, g.value / 100) * 1000) / 10;
    defs.push(S.linearGradient({ id: 'prbig', stops: [[0, S.shade(c, 22)], [1, S.shade(c, -16)]] }));
    body.push(S.textEl({ x: 70, y: top + 150, size: 120, weight: 900, fill: 'url(#prbig)', lines: [`${pct}%`] }));
    body.push(S.textEl({ x: 76, y: top + 192, size: 17, weight: 700, fill: palette.text, lines: [S.ellipsis(g.label ?? '', 300, 17, { bold: true })] }));
    if (g.desc) body.push(S.textEl({ x: 76, y: top + 218, size: 12.5, fill: palette.subtext, lines: [S.ellipsis(g.desc, 320, 12.5)] }));
  }

  // 右侧人形网格
  const gx0 = n === 1 ? 470 : 70;
  const gw = w - gx0 - 70;
  const cell = Math.min(64, gw / perRow);
  const personS = cell * 0.62;
  const rows = Math.ceil(total / perRow);

  groups.forEach((g, gi) => {
    const c = colors[gi];
    const filled = Math.round((Math.min(1, g.value / 100) * total) * 10) / 10;
    const gridTop = top + 40 + gi * (rows * (cell + 8) + (n > 1 ? 58 : 0));
    // 组标签(多组时)
    if (n > 1) {
      body.push(`<rect x="${S.r2(gx0)}" y="${S.r2(gridTop - 26)}" width="14" height="14" rx="4" fill="${c}"/>`);
      body.push(S.textEl({ x: gx0 + 22, y: gridTop - 14, size: 14, weight: 700, fill: palette.text, lines: [S.ellipsis(`${g.label} ${g.value}%`, gw - 30, 14, { bold: true })] }));
    }
    for (let i = 0; i < total; i++) {
      const col = i % perRow, row = Math.floor(i / perRow);
      const px = gx0 + col * cell + cell / 2;
      const py = gridTop + row * (cell + 6);
      const full = i + 1 <= Math.floor(filled);
      const partial = !full && i < filled; // 半人
      if (full) {
        body.push(S.person(px, py, personS, { fill: c }));
      } else if (partial) {
        // 半填充:裁剪
        const clipId = `prc${gi}${i}`;
        defs.push(`<clipPath id="${clipId}"><rect x="0" y="0" width="${S.r2(px)}" height="${h}"/></clipPath>`);
        body.push(S.person(px, py, personS, { fill: S.alpha(palette.subtext, 0.35) }));
        body.push(`<g clip-path="url(#${clipId})">${S.person(px, py, personS, { fill: c })}</g>`);
      } else {
        body.push(S.person(px, py, personS, { fill: S.alpha(palette.subtext, 0.35) }));
      }
    }
  });

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

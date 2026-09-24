/**
 * bar-3d — 3D 分组柱状图
 * 透视地面网格 + box3d 柱体(双系列分组)+ 顶部数值 + y 轴刻度
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const groups = S.take(data.groups ?? data.categories, 6, 'groups');
  const n = groups.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no groups'] }) });

  const seriesNames = data.seriesNames ?? ['A', 'B'];
  const colors = S.seriesColors(palette, 2);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 340, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  defs.push(S.dropShadow({ id: 'b3sh', dy: 5, blur: 10, opacity: 0.14 }));

  const px0 = 108, py1 = h - 110, px1 = w - 100;
  const py0 = data.title ? 168 : 84;
  const D = 26;

  // 取值
  const vals = groups.map((g) => (Array.isArray(g.values) ? g.values.map(Number) : [Number(g.value) || 0, Number(g.value2) || 0]));
  const vMax = Math.max(...vals.flat()) * 1.12 || 1;
  const Y = (v) => py1 - ((py1 - py0) * v) / vMax;

  // 背墙网格
  const ticks = 4;
  for (let t = 0; t <= ticks; t++) {
    const y = Y((vMax * t) / ticks);
    body.push(`<line x1="${px0}" y1="${S.r2(y)}" x2="${px1}" y2="${S.r2(y)}" stroke="${S.alpha(palette.subtext, t === 0 ? 0.5 : 0.16)}" stroke-width="${t === 0 ? 1.5 : 1}"${t === 0 ? '' : ' stroke-dasharray="2 4"'}/>`);
    body.push(S.textEl({ x: px0 - 10, y: y + 4, size: 11.5, fill: S.alpha(palette.subtext, 0.95), anchor: 'end', lines: [S.fmtNum(Math.round((vMax * t) / ticks))] }));
  }
  // 透视地面
  body.push(`<path d="M${px0},${py1} L${px1},${py1} L${S.r2(px1 + D)},${S.r2(py1 + 13)} L${S.r2(px0 + D)},${S.r2(py1 + 13)} Z" fill="${S.alpha(palette.text, 0.05)}" stroke="${palette.line}"/>`);

  const groupW = (px1 - px0) / n;
  const barW = Math.min(46, groupW * 0.26);
  groups.forEach((g, i) => {
    const gx = px0 + groupW * i + groupW / 2;
    vals[i].forEach((v, si) => {
      const c = colors[si];
      const bx = gx - barW - 5 + si * (barW + 10);
      const y = Y(v);
      const bh = Math.max(2, py1 - y);
      const box = S.box3d({ x: bx, y, w: barW, h: bh, d: D * 0.66, fill: c, radius: Math.min(6, barW * 0.18) });
      defs.push(S.volGradient(`b3v${i}_${si}`, c, { top: 18, bottom: -16 }));
      body.push(`<g filter="url(#b3sh)">${box.markup.replace(`fill="${c}" stroke`, `fill="url(#b3v${i}_${si})" stroke`)}</g>`);
      // 顶面数值
      body.push(S.textEl({ x: bx + barW / 2 + D * 0.33, y: y - D * 0.33 - 10, size: 12.5, weight: 800, fill: S.shade(c, -14), anchor: 'middle', lines: [S.fmtNum(v)] }));
    });
    // 组标签
    body.push(S.textEl({ x: S.r2(gx + D * 0.33), y: py1 + 34, size: 13, weight: 700, fill: palette.text, anchor: 'middle', lines: [S.ellipsis(g.label ?? g.name, groupW - 8, 13, { bold: true })] }));
  });

  // 图例(右上)
  const ly = data.title ? 76 : 40;
  let lx = w - 100;
  for (let si = 1; si >= 0; si--) {
    const label = seriesNames[si] ?? `S${si + 1}`;
    const tw = S.textWidth(label, 12.5) + 42;
    lx -= tw;
    body.push(`<rect x="${S.r2(lx)}" y="${S.r2(ly - 7)}" width="14" height="14" rx="4" fill="${colors[si]}"/>`);
    body.push(S.textEl({ x: lx + 20, y: ly + 4, size: 12.5, weight: 600, fill: palette.text, lines: [label] }));
  }

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

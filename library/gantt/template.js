/**
 * gantt — 甘特图
 * 左侧任务列表 + 时间网格 + 3D 胶囊条(进度内芯)+ 今天标线
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const tasks = S.take(data.tasks ?? data.items, 9, 'tasks');
  const n = tasks.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no tasks'] }) });

  const times = tasks.flatMap((t) => [Number(t.start) || 0, (Number(t.start) || 0) + (Number(t.duration) || 1)]);
  const tMin = Math.min(...times), tMax = Math.max(...times);
  const spans = data.spans ?? tasks.map(() => null);
  const colors = S.seriesColors(palette, n);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.05 }));

  defs.push(S.dropShadow({ id: 'gsh', dy: 4, blur: 9, opacity: 0.15 }));

  const leftW = 190;
  const gridX0 = 60 + leftW, gridX1 = w - 64;
  const top = data.title ? 152 : 70;
  const rowH = Math.min(48, (h - top - 76) / n);
  const TW = (v) => gridX0 + ((gridX1 - gridX0) * (v - tMin)) / (tMax - tMin || 1);

  // 时间刻度(按 spans 或均分 6 段)
  const ticksN = 6;
  for (let i = 0; i <= ticksN; i++) {
    const x = gridX0 + ((gridX1 - gridX0) * i) / ticksN;
    body.push(`<line x1="${S.r2(x)}" y1="${S.r2(top - 6)}" x2="${S.r2(x)}" y2="${S.r2(top + rowH * n + 6)}" stroke="${S.alpha(palette.subtext, i === 0 ? 0.4 : 0.14)}" stroke-width="${i === 0 ? 1.4 : 1}"${i === 0 ? '' : ' stroke-dasharray="2 4"'}/>`);
    const v = tMin + ((tMax - tMin) * i) / ticksN;
    body.push(S.textEl({ x: S.r2(x), y: top - 14, size: 11, fill: palette.subtext, anchor: 'middle', lines: [data.tickFormat ? data.tickFormat(v) : `T+${Math.round(v)}`] }));
  }

  tasks.forEach((t, i) => {
    const y = top + i * rowH;
    const c = colors[i % colors.length];
    // 斑马纹
    if (i % 2 === 0) body.push(`<rect x="52" y="${S.r2(y)}" width="${S.r2(w - 104)}" height="${S.r2(rowH)}" rx="8" fill="${S.alpha(palette.text, 0.025)}"/>`);
    // 左侧任务名
    const indent = t.indent ? 18 : 0;
    if (!t.indent) body.push(`<circle cx="${S.r2(66 + indent)}" cy="${S.r2(y + rowH / 2)}" r="4" fill="${c}"/>`);
    else body.push(`<circle cx="${S.r2(70 + indent)}" cy="${S.r2(y + rowH / 2)}" r="2.5" fill="${S.alpha(c, 0.6)}"/>`);
    body.push(S.textEl({ x: 80 + indent, y: y + rowH / 2 + 4.5, size: t.indent ? 12 : 13, weight: t.indent ? 400 : 700, fill: t.indent ? palette.subtext : palette.text, lines: [S.ellipsis(t.label ?? t.task ?? '', leftW - 34 + 60 - indent, t.indent ? 12 : 13, { bold: !t.indent })] }));
    // 条
    const x0 = TW(Number(t.start) || 0);
    const x1 = TW((Number(t.start) || 0) + (Number(t.duration) || 1));
    const bh = t.indent ? 14 : 20;
    const by = y + rowH / 2 - bh / 2;
    const depth = t.indent ? 3 : 5;
    // 3D 底层
    body.push(`<g filter="url(#gsh)"><rect x="${S.r2(x0 + depth)}" y="${S.r2(by - depth)}" width="${S.r2(x1 - x0)}" height="${bh}" rx="${bh / 2}" fill="${S.shade(c, -34)}"/></g>`);
    defs.push(S.linearGradient({ id: `gb${i}`, stops: [[0, S.shade(c, 20)], [1, S.shade(c, -10)]] }));
    body.push(`<rect x="${S.r2(x0)}" y="${S.r2(by)}" width="${S.r2(x1 - x0)}" height="${bh}" rx="${bh / 2}" fill="url(#gb${i})" stroke="${S.alpha(S.shade(c, -20), 0.5)}"/>`);
    // 进度内芯
    if (t.progress != null) {
      const p = Math.max(0, Math.min(1, Number(t.progress)));
      if (p > 0.02) body.push(`<rect x="${S.r2(x0 + 2)}" y="${S.r2(by + 2)}" width="${S.r2((x1 - x0 - 4) * p)}" height="${S.r2(bh - 4)}" rx="${(bh - 4) / 2}" fill="${S.alpha('#ffffff', 0.4)}"/>`);
      body.push(S.textEl({ x: S.r2(x1 + 8), y: by + bh / 2 + 4, size: 11, weight: 700, fill: c, lines: [`${Math.round(p * 100)}%`] }));
    }
  });

  // 今天线
  if (data.now != null) {
    const nx = TW(Number(data.now));
    defs.push(S.linearGradient({ id: 'gnow', stops: [[0, palette.accent], [1, S.shade(palette.accent, 20)]] }));
    body.push(`<line x1="${S.r2(nx)}" y1="${S.r2(top - 22)}" x2="${S.r2(nx)}" y2="${S.r2(top + rowH * n + 12)}" stroke="url(#gnow)" stroke-width="2.5" stroke-dasharray="6 4"/>`);
    const lw = S.textWidth(data.nowLabel ?? '今天', 11, { bold: true }) + 16;
    body.push(`<rect x="${S.r2(nx - lw / 2)}" y="${S.r2(top - 42)}" width="${S.r2(lw)}" height="20" rx="10" fill="${palette.accent}"/>`);
    body.push(S.textEl({ x: S.r2(nx), y: top - 28, size: 11, weight: 700, fill: '#ffffff', anchor: 'middle', lines: [data.nowLabel ?? '今天'] }));
  }

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

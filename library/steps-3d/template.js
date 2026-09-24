/**
 * steps-3d — 3D 上升阶梯
 * 等距阶梯(box3d)逐级抬升,台阶面编号,上方标签卡
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const steps = S.take(data.steps ?? data.stages ?? data.items, 6, 'steps');
  const n = steps.length;
  if (!n) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no steps'] }) });

  const colors = S.seriesColors(palette, n);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  defs.push(S.dropShadow({ id: 'ssh', dy: 8, blur: 16, opacity: 0.18 }));

  const x0 = 120, x1 = w - 140;
  const baseY = h - 110; // 最高台阶顶面基准
  const sw = (x1 - x0) / n;
  const sh = Math.min(64, (baseY - 190) / n); // 每级抬升
  const depth = Math.min(30, sw * 0.32);

  for (let i = 0; i < n; i++) {
    const c = colors[i];
    const stepH = (i + 1) * sh;
    const bx = x0 + i * sw;
    const box = S.box3d({ x: bx, y: baseY - stepH, w: sw - 8, h: stepH, d: depth, fill: c, radius: 0 });
    defs.push(S.volGradient(`sv${i}`, c, { top: 14, bottom: -18 }));
    // 正面用体积渐变
    const grp = box.markup.replace(`fill="${c}" stroke`, `fill="url(#sv${i})" stroke`);
    body.push(`<g filter="url(#ssh)">${grp}</g>`);
    // 台阶编号(顶面)
    const topMidX = bx + (sw - 8) / 2 + depth / 2;
    const topY = baseY - stepH - depth / 2 - 2;
    body.push(`<circle cx="${S.r2(topMidX)}" cy="${S.r2(topY - 22)}" r="13" fill="#ffffff" stroke="${c}" stroke-width="2.5"/>`);
    body.push(S.textEl({ x: topMidX, y: topY - 17.5, size: 12, weight: 800, fill: c, anchor: 'middle', lines: [String(i + 1)] }));
    // 标签
    const labY = topY - 44;
    body.push(S.textEl({ x: S.r2(topMidX), y: labY, size: 14.5, weight: 700, fill: palette.text, anchor: 'middle', lines: [S.ellipsis(steps[i].label, sw - 4, 14.5, { bold: true })] }));
    if (steps[i].desc) {
      body.push(S.textEl({ x: S.r2(topMidX), y: labY + 19, size: 11, fill: palette.subtext, anchor: 'middle', lines: [S.ellipsis(steps[i].desc, sw + 12, 11)] }));
    }
  }

  // 地面
  body.push(`<line x1="${x0 - 30}" y1="${S.r2(baseY + 1)}" x2="${S.r2(x1 + 26)}" y2="${S.r2(baseY + 1)}" stroke="${S.alpha(palette.subtext, 0.35)}" stroke-width="1.5"/>`);
  body.push(S.ellipse((x0 + x1) / 2, baseY + 8, (x1 - x0) / 2 + 20, 14, { fill: S.alpha('#0f172a', 0.08) }));

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

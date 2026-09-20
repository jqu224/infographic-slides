/**
 * org-tree — 组织架构树
 * 渐变根卡 + 分支配色子卡 + 紧凑孙代胶囊,平滑曲线连接
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const root = data.root ?? data.org ?? {};
  const children = (root.children ?? []).filter(Boolean).slice(0, 5);
  if (!children.length) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['need root.children'] }) });

  const branchColors = S.seriesColors(palette, children.length);
  const rootColor = S.shade(palette.series[0], -8);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, branchColors, { o: 0.05 }));

  defs.push(S.dropShadow({ id: 'osh', dy: 6, blur: 13, opacity: 0.16 }));

  // 根卡
  const rootW = 250, rootH = 76;
  const rx = w / 2 - rootW / 2;
  const ry = data.title ? 148 : 66;
  defs.push(S.linearGradient({ id: 'oroot', x1: 0, y1: 0, x2: 1, y2: 1, stops: [[0, S.shade(rootColor, 18)], [1, S.shade(rootColor, -18)]] }));
  body.push(`<g filter="url(#osh)"><rect x="${S.r2(rx)}" y="${S.r2(ry)}" width="${rootW}" height="${rootH}" rx="16" fill="url(#oroot)"/></g>`);
  body.push(S.textEl({ x: w / 2, y: ry + 32, size: 17, weight: 800, fill: '#ffffff', anchor: 'middle', lines: [S.ellipsis(root.label ?? '组织', rootW - 30, 17, { bold: true })] }));
  if (root.desc) body.push(S.textEl({ x: w / 2, y: ry + 54, size: 11, fill: S.alpha('#ffffff', 0.85), anchor: 'middle', lines: [S.ellipsis(root.desc, rootW - 24, 11)] }));

  // 子卡
  const n = children.length;
  const gap = 26;
  const cw = Math.min(216, (w - 96 - gap * (n - 1)) / n);
  const totalW = cw * n + gap * (n - 1);
  const x0 = (w - totalW) / 2;
  const cy = ry + rootH + 78;
  const chH = 66;

  children.forEach((c, i) => {
    const bc = branchColors[i];
    const x = x0 + i * (cw + gap);
    const cxm = x + cw / 2;
    // 连接曲线:根底 → 子顶
    const y1 = ry + rootH, y2 = cy;
    const midY = (y1 + y2) / 2;
    body.push(`<path d="M${S.r2(w / 2)},${S.r2(y1)} C${S.r2(w / 2)},${S.r2(midY)} ${S.r2(cxm)},${S.r2(midY)} ${S.r2(cxm)},${S.r2(y2)}" fill="none" stroke="${S.alpha(bc, 0.55)}" stroke-width="2"/>`);
    // 卡
    defs.push(S.linearGradient({ id: `oc${i}`, stops: [[0, S.shade(bc, 22)], [1, S.shade(bc, -6)]] }));
    body.push(`<g filter="url(#osh)"><rect x="${S.r2(x)}" y="${S.r2(cy)}" width="${S.r2(cw)}" height="${chH}" rx="13" fill="url(#oc${i})"/></g>`);
    body.push(S.textEl({ x: cxm, y: cy + 27, size: 14.5, weight: 800, fill: '#ffffff', anchor: 'middle', lines: [S.ellipsis(c.label ?? `部门${i + 1}`, cw - 26, 14.5, { bold: true })] }));
    if (c.value != null || c.desc) body.push(S.textEl({ x: cxm, y: cy + 48, size: 11, fill: S.alpha('#ffffff', 0.88), anchor: 'middle', lines: [S.ellipsis(c.desc ?? `${c.value} 人`, cw - 22, 11)] }));
    // 孙代胶囊
    const subs = (c.children ?? []).filter(Boolean).slice(0, 4);
    subs.forEach((s, j) => {
      const sy = cy + chH + 22 + j * 34;
      const stemX = cxm;
      body.push(`<line x1="${S.r2(stemX)}" y1="${S.r2(sy - 34 + 24)}" x2="${S.r2(stemX)}" y2="${S.r2(sy - 12)}" stroke="${S.alpha(bc, 0.4)}" stroke-width="1.5"/>`);
      const pw = Math.min(cw, S.textWidth(s.label ?? s, 11.5) + 34);
      body.push(`<rect x="${S.r2(cxm - pw / 2)}" y="${S.r2(sy - 12)}" width="${S.r2(pw)}" height="24" rx="12" fill="#ffffff" fill-opacity="0.9" stroke="${S.alpha(bc, 0.45)}" filter="url(#osh)"/>`);
      body.push(`<circle cx="${S.r2(cxm - pw / 2 + 12)}" cy="${S.r2(sy)}" r="3" fill="${bc}"/>`);
      body.push(S.textEl({ x: cxm - pw / 2 + 22, y: sy + 4, size: 11.5, weight: 600, fill: palette.text, lines: [S.ellipsis(s.label ?? s, pw - 34, 11.5, { bold: true })] }));
    });
  });

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

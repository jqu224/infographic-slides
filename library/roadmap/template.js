/**
 * roadmap — 路线图
 * 三段相位底色带 + S 型道路 + 里程碑 pin,支持"当前位置"标记
 */
import * as S from '../_shared/svg.mjs';

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const phases = (data.phases ?? []).filter(Boolean).slice(0, 3);
  const milestones = (data.milestones ?? data.items ?? []).filter(Boolean).slice(0, 8);
  if (!milestones.length) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['no milestones'] }) });

  const pColors = phases.length ? S.seriesColors(palette, phases.length) : [];
  const mColors = S.seriesColors(palette, Math.max(milestones.length, 3));
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, mColors, { o: 0.05 }));

  const zoneTop = data.title ? 150 : 66;
  const zoneBottom = h - 66;
  const zx0 = 60, zx1 = w - 60;

  // 相位底色带
  if (phases.length) {
    const pw = (zx1 - zx0) / phases.length;
    phases.forEach((p, i) => {
      const c = pColors[i];
      const x = zx0 + i * pw;
      body.push(`<rect x="${S.r2(x)}" y="${zoneTop}" width="${S.r2(pw - 8)}" height="${S.r2(zoneBottom - zoneTop)}" rx="14" fill="${S.alpha(c, 0.06)}" stroke="${S.alpha(c, 0.18)}" stroke-width="1"/>`);
      body.push(S.textEl({ x: x + 18, y: zoneTop + 30, size: 14.5, weight: 800, fill: c, lines: [S.ellipsis(p.label, pw - 40, 14.5, { bold: true })] }));
      body.push(S.textEl({ x: x + 18, y: zoneTop + 50, size: 10.5, fill: S.alpha(palette.subtext, 0.9), lines: [S.ellipsis(p.desc ?? '', pw - 36, 10.5)] }));
    });
  }

  // S 型道路
  const midY = (zoneTop + zoneBottom) / 2 + 20;
  const road = `M${zx0 + 60},${midY + 70} C${zx0 + 260},${midY + 70} ${zx0 + 220},${midY - 80} ${w / 2},${midY - 70} S${zx1 - 200},${midY + 80} ${zx1 - 40},${midY + 10}`;
  defs.push(S.linearGradient({ id: 'rmroad', x1: 0, y1: 0, x2: 1, y2: 0, stops: mColors.map((c, i) => [i / mColors.length, c]) }));
  defs.push(S.dropShadow({ id: 'rmsh', dy: 5, blur: 10, opacity: 0.16 }));
  body.push(`<path d="${road}" fill="none" stroke="${S.alpha(palette.text, 0.08)}" stroke-width="26" stroke-linecap="round"/>`);
  body.push(`<path d="${road}" fill="none" stroke="url(#rmroad)" stroke-width="14" stroke-linecap="round" filter="url(#rmsh)"/>`);
  body.push(`<path d="${road}" fill="none" stroke="${S.alpha('#ffffff', 0.75)}" stroke-width="2" stroke-dasharray="2 10" stroke-linecap="round"/>`);

  // 里程碑:沿曲线采样取点
  // 采样点集
  const pts = [];
  {
    // 用两段三次贝塞尔解析式
    const segs = [
      { p0: [zx0 + 60, midY + 70], c1: [zx0 + 260, midY + 70], c2: [zx0 + 220, midY - 80], p1: [w / 2, midY - 70] },
      // S 命令 = 上一控制点关于 p1 的反射
      { p0: [w / 2, midY - 70], c1: [w - (zx0 + 220), 2 * (midY - 70) - (midY - 80)], c2: [zx1 - 200, midY + 80], p1: [zx1 - 40, midY + 10] },
    ];
    for (const sg of segs) {
      for (let t = 0; t <= 1.001; t += 0.02) {
        const mt = 1 - t;
        const x = mt ** 3 * sg.p0[0] + 3 * mt * mt * t * sg.c1[0] + 3 * mt * t * t * sg.c2[0] + t ** 3 * sg.p1[0];
        const y = mt ** 3 * sg.p0[1] + 3 * mt * mt * t * sg.c1[1] + 3 * mt * t * t * sg.c2[1] + t ** 3 * sg.p1[1];
        pts.push([x, y]);
      }
    }
  }
  const roadPoint = (t) => pts[Math.min(pts.length - 1, Math.round(t * (pts.length - 1)))];

  milestones.forEach((ms, i) => {
    const t = (i + 0.5) / milestones.length;
    const [x, y] = roadPoint(t);
    const c = mColors[i];
    const up = i % 2 === 0;
    // pin
    body.push(`<g filter="url(#rmsh)">
<circle cx="${S.r2(x)}" cy="${S.r2(y)}" r="15" fill="#ffffff" stroke="${c}" stroke-width="3.5"/>
<circle cx="${S.r2(x)}" cy="${S.r2(y)}" r="6" fill="${c}"/>
</g>`);
    // 标签
    const ty = up ? y - 36 : y + 44;
    body.push(S.textEl({ x: S.r2(x), y: ty, size: 13.5, weight: 700, fill: palette.text, anchor: 'middle', lines: [S.ellipsis(ms.label, 150, 13.5, { bold: true })] }));
    if (ms.date || ms.desc) {
      body.push(S.textEl({ x: S.r2(x), y: ty + 17, size: 10.5, fill: palette.subtext, anchor: 'middle', lines: [S.ellipsis(ms.date ? `${ms.date}${ms.desc ? ' · ' + ms.desc : ''}` : ms.desc, 160, 10.5)] }));
    }
    // stem
    body.push(`<line x1="${S.r2(x)}" y1="${S.r2(up ? y - 15 : y + 15)}" x2="${S.r2(x)}" y2="${S.r2(up ? ty + 22 : ty - 26)}" stroke="${S.alpha(c, 0.5)}" stroke-width="1.5" stroke-dasharray="3 3"/>`);
  });

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

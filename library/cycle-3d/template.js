/**
 * cycle-3d — 3D 循环闭环图
 * 渐变环形分段 + 箭头衔接 + 双层厚度,中心标题,外圈编号与标签
 */
import * as S from '../_shared/svg.mjs';

const polar = (cx, cy, R, aDeg) => {
  const a = ((aDeg - 90) * Math.PI) / 180;
  return [cx + R * Math.cos(a), cy + R * Math.sin(a)];
};

function donutSeg(cx, cy, R, r, a0, a1) {
  const large = a1 - a0 > 180 ? 1 : 0;
  const [x0, y0] = polar(cx, cy, R, a0), [x1, y1] = polar(cx, cy, R, a1);
  const [x2, y2] = polar(cx, cy, r, a1), [x3, y3] = polar(cx, cy, r, a0);
  return `M${S.r2(x0)},${S.r2(y0)} A${S.r2(R)},${S.r2(R)} 0 ${large} 1 ${S.r2(x1)},${S.r2(y1)} L${S.r2(x2)},${S.r2(y2)} A${S.r2(r)},${S.r2(r)} 0 ${large} 0 ${S.r2(x3)},${S.r2(y3)} Z`;
}

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const nodes = (data.nodes ?? data.stages ?? data.items ?? []).filter(Boolean).slice(0, 7);
  const n = nodes.length;
  if (n < 2) return S.svgDoc({ w, h, palette, body: S.textEl({ x: w / 2, y: h / 2, anchor: 'middle', fill: palette.subtext, lines: ['need 3-6 nodes'] }) });

  const colors = S.seriesColors(palette, n);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  const cx = opts.cx ?? 480, cy = opts.cy ?? 315;
  const R = Math.min(150, (h - 210) / 2 + 26), r = R - 46;
  const gapA = 7; // 分段间隙角度
  const step = 360 / n;

  defs.push(S.dropShadow({ id: 'c3sh', dy: 7, blur: 14, opacity: 0.18 }));

  const ring = [];
  for (let i = 0; i < n; i++) {
    const c = colors[i];
    const a0 = i * step + gapA / 2, a1 = (i + 1) * step - gapA / 2;
    // 底层厚度
    ring.push(`<path d="${donutSeg(cx, cy + 5, R, r, a0, a1)}" fill="${S.shade(c, -32)}"/>`);
    defs.push(S.linearGradient({ id: `c3g${i}`, stops: [[0, S.shade(c, 20)], [1, S.shade(c, -8)]] }));
    ring.push(`<path d="${donutSeg(cx, cy, R, r, a0, a1)}" fill="url(#c3g${i})" stroke="${S.alpha(S.shade(c, -14), 0.5)}" stroke-width="1"/>`);
    // 衔接箭头(段末)
    const [ax, ay] = polar(cx, cy, (R + r) / 2, a1 + gapA / 2);
    const aRad = ((a1 + gapA / 2 - 90 + 90) * Math.PI) / 180; // 箭头指向切线方向
    const tangent = ((a1 + gapA / 2) * Math.PI) / 180; // 切线角
    ring.push(`<path d="M${S.r2(ax)},${S.r2(ay)} l${S.r2(-11 * Math.cos(tangent - 0.42))},${S.r2(-11 * Math.sin(tangent - 0.42))} l${S.r2(-11 * Math.cos(tangent + 0.42))},${S.r2(-11 * Math.sin(tangent + 0.42))} Z" fill="${S.shade(c, -18)}"/>`);
    // 编号徽章(段中)
    const mid = (a0 + a1) / 2;
    const [bx, by] = polar(cx, cy, (R + r) / 2, mid);
    ring.push(`<circle cx="${S.r2(bx)}" cy="${S.r2(by)}" r="13" fill="#ffffff" fill-opacity="0.92" stroke="${c}" stroke-width="2"/>`);
    ring.push(S.textEl({ x: bx, y: by + 4.5, size: 12, weight: 800, fill: c, anchor: 'middle', lines: [String(i + 1)] }));
  }
  body.push(`<g filter="url(#c3sh)">${ring.join('\n')}</g>`);

  // 中心
  body.push(S.ellipse(cx, cy + 3, r - 14, r - 14, { fill: S.alpha(palette.text, 0.06) }));
  body.push(S.textEl({ x: cx, y: cy - 4, size: 17, weight: 800, fill: palette.text, anchor: 'middle', lines: [S.ellipsis(data.center ?? '闭环', r * 1.6, 17, { bold: true })] }));
  body.push(S.textEl({ x: cx, y: cy + 20, size: 11.5, fill: palette.subtext, anchor: 'middle', lines: [S.ellipsis(data.centerDesc ?? '', r * 1.7, 11.5)] }));

  // 外圈标签(左右两侧分布,避免上下出界)
  const left = [], right = [];
  nodes.forEach((it, i) => {
    const c = colors[i];
    const mid = i * step + step / 2;
    const [ox, oy] = polar(cx, cy, R + 30, mid);
    const isRight = Math.cos(((mid - 90) * Math.PI) / 180) >= 0;
    const anchor = isRight ? 'start' : 'end';
    const tx = isRight ? ox + 14 : ox - 14;
    const label = S.ellipsis(it.label, 150, 13.5, { bold: true });
    const desc = S.ellipsis(it.desc ?? '', 160, 11);
    const blk = `<circle cx="${S.r2(ox)}" cy="${S.r2(oy)}" r="3.5" fill="${c}"/>
<line x1="${S.r2(ox)}" y1="${S.r2(oy)}" x2="${S.r2(isRight ? ox + 10 : ox - 10)}" y2="${S.r2(oy)}" stroke="${S.alpha(c, 0.5)}" stroke-width="1.5"/>
${S.textEl({ x: tx, y: oy - 3, size: 13.5, weight: 700, fill: palette.text, anchor, lines: [label] })}
${it.desc ? S.textEl({ x: tx, y: oy + 15, size: 11, fill: palette.subtext, anchor, lines: [desc] }) : ''}`;
    (isRight ? right : left).push(blk);
  });
  body.push(left.join('\n'), right.join('\n'));

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

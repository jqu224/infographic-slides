/**
 * swot — SWOT 四象限分析
 * 大字母渐变水印 + 四色玻璃卡 + 图标 + 要点列表
 */
import * as S from '../_shared/svg.mjs';

const DEF = [
  { key: 'S', label: 'Strengths', zh: '优势', icon: 'trophy' },
  { key: 'W', label: 'Weaknesses', zh: '劣势', icon: 'shield' },
  { key: 'O', label: 'Opportunities', zh: '机会', icon: 'trend' },
  { key: 'T', label: 'Threats', zh: '威胁', icon: 'clock' },
];

export function render({ data, palette, w = 960, h = 540, opts = {} }) {
  const quads = data.quadrants ?? data.swot ?? [];
  const items = DEF.map((d, i) => quads[i] ?? { label: d.zh, children: [] });
  const colors = S.seriesColors(palette, 4);
  const defs = [];
  const body = [];

  body.push(S.header({ title: data.title, subtitle: data.subtitle ?? data.desc ?? `${data.subject ?? ''} SWOT 分析`, w: w - 96, palette }));
  body.push(S.blobs(w, h, colors, { o: 0.06 }));

  defs.push(S.dropShadow({ id: 'swsh', dy: 7, blur: 15, opacity: 0.14 }));

  const top = data.title ? 150 : 66;
  const gx = 22, gy = 20;
  const cw = (w - 96 - gx) / 2;
  const ch = (h - top - 52 - gy) / 2;
  const pos = [
    [48, top], [48 + cw + gx, top],
    [48, top + ch + gy], [48 + cw + gx, top + ch + gy],
  ];

  items.forEach((q, i) => {
    const d = DEF[i];
    const c = colors[i];
    const [x, y] = pos[i];
    const gc = S.glassCard({ x, y, w: cw, h: ch, rx: 16, color: c, id: `swgc${i}`, filter: 'swsh' });
    defs.push(gc.defs);
    body.push(gc.body);
    // 大字母水印
    defs.push(S.linearGradient({ id: `swl${i}`, stops: [[0, S.alpha(c, 0.3)], [1, S.alpha(c, 0.08)]] }));
    body.push(S.textEl({ x: x + cw - 20, y: y + 78, size: 64, weight: 900, fill: `url(#swl${i})`, anchor: 'end', lines: [d.key] }));
    // 图标 + 标题
    body.push(`<circle cx="${S.r2(x + 46)}" cy="${S.r2(y + 44)}" r="21" fill="${S.alpha(c, 0.14)}"/>`);
    body.push(S.icon(q.icon ?? d.icon, { x: x + 36, y: y + 34, size: 20, color: c }));
    body.push(S.textEl({ x: x + 76, y: y + 40, size: 16.5, weight: 800, fill: palette.text, lines: [S.ellipsis(q.label ?? d.zh, cw - 150, 16.5, { bold: true })] }));
    body.push(S.textEl({ x: x + 76, y: y + 58, size: 10.5, fill: palette.subtext, lines: [d.label] }));
    // 要点
    const rows = (q.children ?? q.items ?? q.points ?? []).filter(Boolean).slice(0, 3);
    rows.forEach((it, j) => {
      const ry = y + 92 + j * 26;
      body.push(`<circle cx="${S.r2(x + 42)}" cy="${S.r2(ry - 4)}" r="3" fill="${c}"/>`);
      body.push(S.textEl({ x: x + 54, y: ry, size: 12, weight: 500, fill: S.alpha(palette.text, 0.92), lines: [S.ellipsis(it.label ?? it, cw - 76, 12)] }));
    });
  });

  // 中心联结
  const cx = 48 + cw + gx / 2, cy = top + ch + gy / 2;
  body.push(`<circle cx="${S.r2(cx)}" cy="${S.r2(cy)}" r="26" fill="#ffffff" fill-opacity="0.9" stroke="${palette.line}" filter="url(#swsh)"/>`);
  body.push(S.textEl({ x: cx, y: cy + 5.5, size: 13, weight: 800, fill: palette.text, anchor: 'middle', lines: ['SWOT'] }));

  return S.svgDoc({ w, h, palette, defs: defs.join('\n'), body: body.join('\n') });
}

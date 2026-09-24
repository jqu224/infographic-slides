/**
 * _shared/svg.mjs — 零依赖 SVG 绘图工具箱
 *
 * 设计语言「Aurora Glass」:
 *  - 多色系 series 配色,拒绝单色
 *  - 3D 体积感 = 顶面提亮 / 侧面压暗 + 线性渐变 + 柔和投影
 *  - 圆角卡片 + 半透明玻璃 + 角落装饰光斑
 *  - 文字永远正投影,保证可读
 */

export const FONT = `-apple-system, 'PingFang SC', 'Microsoft YaHei', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif`;

/* ---------------- 基础 ---------------- */

export const r2 = (n) => Math.round(n * 100) / 100;

export function esc(s = '') {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/* ---------------- 颜色 ---------------- */

export function hexToRgb(hex = '#000000') {
  let h = hex.replace('#', '').trim();
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function rgbToHex(r, g, b) {
  const c = (v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0');
  return `#${c(r)}${c(g)}${c(b)}`;
}

/** pct > 0 向白提亮, < 0 向黑压暗 */
export function shade(hex, pct) {
  const { r, g, b } = hexToRgb(hex);
  const t = pct > 0 ? 255 : 0;
  const p = Math.abs(pct) / 100;
  return rgbToHex(r + (t - r) * p, g + (t - g) * p, b + (t - b) * p);
}

export function mix(hexA, hexB, t = 0.5) {
  const a = hexToRgb(hexA), b = hexToRgb(hexB);
  return rgbToHex(a.r + (b.r - a.r) * t, a.g + (b.g - a.g) * t, a.b + (b.b - a.b) * t);
}

export function alpha(hex, a = 1) {
  const { r, g, b } = hexToRgb(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** 从色板取 n 个系列色(不足时循环) */
export function seriesColors(palette, n) {
  const s = palette.series;
  return Array.from({ length: n }, (_, i) => s[i % s.length]);
}

/** Cap a list; warn when items are dropped past the hard max */
export function take(list, max, field) {
  const arr = (list ?? []).filter(Boolean);
  if (arr.length > max) console.warn(`[infographic] truncated ${field}: ${arr.length} -> ${max}`);
  return arr.slice(0, max);
}

/* ---------------- 文档骨架 ---------------- */

export function svgDoc({ w = 960, h = 540, defs = '', body = '', bg, bg2, palette }) {
  const background = bg ?? palette?.bg ?? '#f8fafc';
  const bgGradient = bg2 ?? palette?.bg2 ?? background;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" font-family="${FONT}">
<defs>
<linearGradient id="__bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${background}"/><stop offset="1" stop-color="${bgGradient}"/></linearGradient>
${defs}
</defs>
<rect x="0" y="0" width="${w}" height="${h}" fill="url(#__bg)"/>
${body}
</svg>`;
}

/** 角落装饰光斑(高级感背景点缀) */
export function blobs(w, h, colors, { r = 150, o = 0.10 } = {}) {
  const spots = [
    [w * 0.94, h * 0.06, r], [w * 0.05, h * 0.95, r * 0.9],
    [w * 0.88, h * 0.9, r * 0.7], [w * 0.08, h * 0.08, r * 0.6],
  ];
  return spots
    .map(([cx, cy, rr], i) => `<circle cx="${r2(cx)}" cy="${r2(cy)}" r="${r2(rr)}" fill="${alpha(colors[i % colors.length], o)}"/>`)
    .join('\n');
}

/* ---------------- 渐变 / 滤镜 ---------------- */

/** stops: [offset, color, opacity?] */
export function linearGradient({ id, x1 = 0, y1 = 0, x2 = 0, y2 = 1, stops = [] }) {
  const s = stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${s}</linearGradient>`;
}

export function radialGradient({ id, cx = 0.5, cy = 0.5, r = 0.65, stops = [] }) {
  const s = stops.map(([o, c, op]) => `<stop offset="${o}" stop-color="${c}"${op != null ? ` stop-opacity="${op}"` : ''}/>`).join('');
  return `<radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}">${s}</radialGradient>`;
}

export function dropShadow({ id, dx = 0, dy = 6, blur = 14, color = '#0f172a', opacity = 0.16 }) {
  return `<filter id="${id}" x="-40%" y="-40%" width="180%" height="180%">
<feDropShadow dx="${dx}" dy="${dy}" stdDeviation="${blur / 2}" flood-color="${color}" flood-opacity="${opacity}"/>
</filter>`;
}

/** 垂直体积渐变:顶亮底暗,给 3D 面用 */
export function volGradient(id, color, { top = 26, bottom = -14 } = {}) {
  return linearGradient({ id, stops: [[0, shade(color, top)], [1, shade(color, bottom)]] });
}

/* ---------------- 几何 ---------------- */

export const pts = (list) => list.map(([x, y]) => `${r2(x)},${r2(y)}`).join(' ');

/** 30° 等距投影:p(x, y, z) → 屏幕 [sx, sy] */
export function iso({ angle = 30 } = {}) {
  const a = (angle * Math.PI) / 180;
  const cos = Math.cos(a), sin = Math.sin(a);
  return {
    cos, sin,
    p(x, y, z = 0) { return [(x - y) * cos, (x + y) * sin - z]; },
  };
}

/**
 * 前朝向 3D 盒体(柱体/台阶/积木):
 * 正面矩形 (x,y,w,h),深度 d 沿右上 30° 伸展。
 * 返回三面 path 与可直接使用的 markup。
 */
export function box3d({ x, y, w, h, d = 18, fill, id, radius = 0, stroke = null, sw = 1 }) {
  const P = iso();
  const dx = d * P.cos, dy = d * P.sin;
  const c = stroke ?? alpha(fill, 0.5);
  const front = roundedRectPath(x, y, w, h, radius);
  const top = `M${r2(x)},${r2(y)} L${r2(x + dx)},${r2(y - dy)} L${r2(x + w + dx)},${r2(y - dy)} L${r2(x + w)},${r2(y)} Z`;
  const right = `M${r2(x + w)},${r2(y)} L${r2(x + w + dx)},${r2(y - dy)} L${r2(x + w + dx)},${r2(y + h - dy)} L${r2(x + w)},${r2(y + h)} Z`;
  const markup = [
    `<path d="${top}" fill="${shade(fill, 24)}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    `<path d="${right}" fill="${shade(fill, -20)}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>`,
    `<path d="${front}" fill="${fill}" stroke="${c}" stroke-width="${sw}" stroke-linejoin="round"/>`,
  ].join('');
  return { front, top, right, markup, dx, dy };
}

/** 圆角矩形 path(可以只给部分圆角) */
export function roundedRectPath(x, y, w, h, r = 0) {
  const rr = Math.min(r, w / 2, h / 2);
  if (rr <= 0) return `M${r2(x)},${r2(y)} h${r2(w)} v${r2(h)} h${r2(-w)} Z`;
  return `M${r2(x + rr)},${r2(y)} h${r2(w - 2 * rr)} a${rr},${rr} 0 0 1 ${rr},${rr} v${r2(h - 2 * rr)} a${rr},${rr} 0 0 1 ${-rr},${rr} h${r2(-(w - 2 * rr))} a${rr},${rr} 0 0 1 ${-rr},${-rr} v${r2(-(h - 2 * rr))} a${rr},${rr} 0 0 1 ${rr},${-rr} Z`;
}

export function ellipse(cx, cy, rx, ry, { fill, stroke, sw = 1, opacity } = {}) {
  return `<ellipse cx="${r2(cx)}" cy="${r2(cy)}" rx="${r2(rx)}" ry="${r2(ry)}" fill="${fill}"${stroke ? ` stroke="${stroke}" stroke-width="${sw}"` : ''}${opacity != null ? ` opacity="${opacity}"` : ''}/>`;
}

/* ---------------- 文字 ---------------- */

/** 估算文字宽度: CJK ≈ 1em, 拉丁/数字 ≈ 0.58em */
export function textWidth(text, size, { bold = false } = {}) {
  let w = 0;
  for (const ch of String(text)) {
    const cjk = /[\u2e80-\u9fff\uf900-\ufaff\uff00-\uffef\u3000-\u303f]/.test(ch);
    w += cjk ? 1 : /[iljtf.,'\u2019!|(){}[\]]/.test(ch) ? 0.32 : /[A-Z0-9@#%&WM]/.test(ch) ? 0.72 : 0.55;
  }
  return w * size * (bold ? 1.06 : 1);
}

/** 自动缩字号塞进 maxW */
export function fitSize(text, maxW, start, { min = 10, bold = false } = {}) {
  let s = start;
  while (s > min && textWidth(text, s, { bold }) > maxW) s -= 1;
  return s;
}

export function ellipsis(text, maxW, size, { bold = false } = {}) {
  if (textWidth(text, size, { bold }) <= maxW) return String(text);
  let t = String(text);
  while (t.length > 1 && textWidth(t + '…', size, { bold }) > maxW) t = t.slice(0, -1);
  return t + '…';
}

/** 多行文字,返回 <text> */
export function textEl({ x, y, size = 14, fill = '#1e293b', weight = 400, anchor = 'start', lines = [], leading = 1.45, opacity, letterSpacing }) {
  const tspans = (Array.isArray(lines) ? lines : [lines])
    .map((ln, i) => `<tspan x="${r2(x)}" dy="${i === 0 ? 0 : r2(size * leading)}">${esc(ln)}</tspan>`)
    .join('');
  return `<text x="${r2(x)}" y="${r2(y)}" font-size="${size}" font-weight="${weight}" fill="${fill}" text-anchor="${anchor}"${opacity != null ? ` opacity="${opacity}"` : ''}${letterSpacing ? ` letter-spacing="${letterSpacing}"` : ''}>${tspans}</text>`;
}

/** 标题 + 副标题(统一版式) */
export function header({ title, subtitle, x = 48, y = 56, w = 864, palette, titleSize = 27, subSize = 13.5 }) {
  const out = [];
  if (title) {
    const s = fitSize(title, w, titleSize, { min: 16, bold: true });
    out.push(textEl({ x, y, size: s, weight: 700, fill: palette.text, lines: [ellipsis(title, w, s, { bold: true })] }));
  }
  if (subtitle) {
    out.push(textEl({ x, y: y + 24, size: subSize, fill: palette.subtext, lines: [ellipsis(subtitle, w, subSize)] }));
  }
  return out.join('\n');
}

/* ---------------- 卡片 ---------------- */

export function card({ x, y, w, h, rx = 14, fill = '#ffffff', fillOp = 0.86, stroke = '#e2e8f0', filter, extra = '' }) {
  return `<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${r2(h)}" rx="${rx}" fill="${fill}" fill-opacity="${fillOp}" stroke="${stroke}" stroke-width="1"${filter ? ` filter="url(#${filter})"` : ''}${extra}/>`;
}

/** 渐变描边卡片(玻璃质感) */
export function glassCard({ x, y, w, h, rx = 14, color, id, filter }) {
  const g = linearGradient({ id, x1: 0, y1: 0, x2: 1, y2: 1, stops: [[0, alpha(color, 0.55)], [0.5, alpha(color, 0.12)], [1, alpha(color, 0.35)]] });
  const body = card({ x, y, w, h, rx, fill: '#ffffff', fillOp: 0.82, filter });
  return { defs: g, body: `<rect x="${r2(x + 0.5)}" y="${r2(y + 0.5)}" width="${r2(w - 1)}" height="${r2(h - 1)}" rx="${rx}" fill="none" stroke="url(#${id})" stroke-width="1.5"/>\n${body}` };
}

/* ---------------- 迷你图标库(24×24, 线性) ---------------- */

const ICON_PATHS = {
  check: 'M5 13l4 4L19 7',
  star: 'M12 3l2.7 5.6 6.3.7-4.6 4.3 1.2 6.4L12 16.9 6.4 20l1.2-6.4L3 9.3l6.3-.7z',
  trend: 'M7 17L17 7M9 7h8v8',
  users: 'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8',
  user: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8',
  target: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10zM12 13a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  bolt: 'M13 2L4 14h6l-1 8 9-12h-6l1-8z',
  clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2',
  shield: 'M12 2l8 3v6c0 5-3.5 8.6-8 11-4.5-2.4-8-6-8-11V5l8-3z',
  globe: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM3 12h18M12 3c2.5 2.4 4 5.6 4 9s-1.5 6.6-4 9c-2.5-2.4-4-5.6-4-9s1.5-6.6 4-9z',
  heart: 'M12 21C7 16.6 3 13.3 3 9a4.6 4.6 0 0 1 9-1.5A4.6 4.6 0 0 1 21 9c0 4.3-4 7.6-9 12z',
  rocket: 'M4.5 16.5L3 21l4.5-1.5M15 9c3 0 5 2 5 5 0 4-4 8-8 10l-3-3C11 17 11 9 15 9zM14 10a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
  flag: 'M5 21V4M5 4c4-2 6 2 10 0v9c-4 2-6-2-10 0',
  trophy: 'M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0V4zM7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3',
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 1 3.7 10.7c-.7.6-.7 1.4-.7 2.3H9c0-.9 0-1.7-.7-2.3A6 6 0 0 1 12 3z',
  wallet: 'M3 7a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7zM3 7l13-3.5M16 13h4',
  database: 'M12 8c4.4 0 8-1.3 8-3s-3.6-3-8-3-8 1.3-8 3 3.6 3 8 3zM4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3',
  gear: 'M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zM12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.1 2.1M17 17l2.1 2.1M19.1 4.9L17 7M7 17l-2.1 2.1',
  mail: 'M4 6h16a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1zM3 7.5l9 6 9-6',
  calendar: 'M5 5h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1zM16 2v4M8 2v4M4 10h17',
  pin: 'M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z',
  cycle: 'M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6',
  layers: 'M12 3l9 5-9 5-9-5 9-5zM3 13l9 5 9-5M3 17l9 5 9-5',
  search: 'M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16zM21 21l-4.3-4.3',
  code: 'M8 6l-5 6 5 6M16 6l5 6-5 6',
  doc: 'M6 2h8l4 4v16H6V2zM14 2v5h4M9 12h6M9 16h6',
  cart: 'M3 3h2l2.6 13h11L21 6H6M9 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2zM18 21a1 1 0 1 0 0-2 1 1 0 0 0 0 2z',
};

/** 语义匹配:用户写 "chart line" 也能命中 trend */
const ICON_ALIAS = {
  'chart line': 'trend', 'chart': 'trend', 'trending up': 'trend', 'arrow up': 'trend',
  'people': 'users', 'member': 'users', 'team': 'users',
  'lightning': 'bolt', 'flash': 'bolt', 'fast': 'bolt',
  'time': 'clock', 'schedule': 'clock',
  'safe': 'shield', 'security': 'shield', 'security check': 'shield',
  'world': 'globe', 'earth': 'globe',
  'idea': 'bulb', 'insight': 'bulb',
  'money': 'wallet', 'pay': 'wallet', 'price': 'wallet', 'revenue': 'wallet',
  'db': 'database', 'data': 'database', 'server': 'database',
  'setting': 'gear', 'settings': 'gear',
  'email': 'mail', 'message': 'mail',
  'date': 'calendar', 'event': 'calendar',
  'location': 'pin', 'map': 'pin', 'milestone': 'pin',
  'loop': 'cycle', 'repeat': 'cycle', 'retention': 'cycle', 'refresh': 'cycle',
  'stack': 'layers', 'layer': 'layers',
  'find': 'search', 'discover': 'search',
  'developer': 'code', 'dev': 'code', 'build': 'code',
  'document': 'doc', 'report': 'doc', 'text': 'doc',
  'shopping': 'cart', 'order': 'cart', 'purchase': 'cart',
  'win': 'trophy', 'award': 'trophy', 'top': 'trophy', 'goal': 'target',
  'start': 'flag', 'launch': 'rocket', 'growth': 'trend', 'love': 'heart',
};

export function iconName(name) {
  const key = String(name ?? '').trim().toLowerCase();
  return ICON_PATHS[key] ? key : ICON_ALIAS[key] ?? 'check';
}

/** 画一个线性图标(24 viewBox 缩放到 size) */
export function icon(name, { x = 0, y = 0, size = 20, color = '#334155', sw = 2, filled = false } = {}) {
  const d = ICON_PATHS[iconName(name)];
  const k = size / 24;
  return `<g transform="translate(${r2(x)},${r2(y)}) scale(${r2(k)})">
<path d="${d}" fill="${filled && ['star', 'bolt', 'heart'].includes(iconName(name)) ? color : 'none'}" stroke="${color}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>
</g>`;
}

/** 人物象形图(pictogram) */
export function person(cx, topY, s, { fill = '#94a3b8', opacity = 1 } = {}) {
  const hr = s * 0.23;
  const hy = topY + hr;
  const bodyTop = topY + s * 0.5;
  const bodyR = s * 0.33;
  const bodyBottom = topY + s;
  return `<g opacity="${opacity}">
<circle cx="${r2(cx)}" cy="${r2(hy)}" r="${r2(hr)}" fill="${fill}"/>
<path d="M${r2(cx - bodyR)},${r2(bodyBottom)} L${r2(cx - bodyR)},${r2(bodyTop)} A${r2(bodyR)},${r2(bodyR * 0.95)} 0 0 1 ${r2(cx + bodyR)},${r2(bodyTop)} L${r2(cx + bodyR)},${r2(bodyBottom)} Z" fill="${fill}"/>
</g>`;
}

/* ---------------- 平滑曲线 ---------------- */

/** Catmull-Rom → cubic bezier 平滑折线 */
export function smoothPath(pts, { tension = 0.5 } = {}) {
  if (pts.length < 2) return '';
  if (pts.length === 2) return `M${r2(pts[0][0])},${r2(pts[0][1])} L${r2(pts[1][0])},${r2(pts[1][1])}`;
  let d = `M${r2(pts[0][0])},${r2(pts[0][1])}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = p1[0] + ((p2[0] - p0[0]) / 6) * tension * 2;
    const c1y = p1[1] + ((p2[1] - p0[1]) / 6) * tension * 2;
    const c2x = p2[0] - ((p3[0] - p1[0]) / 6) * tension * 2;
    const c2y = p2[1] - ((p3[1] - p1[1]) / 6) * tension * 2;
    d += ` C${r2(c1x)},${r2(c1y)} ${r2(c2x)},${r2(c2y)} ${r2(p2[0])},${r2(p2[1])}`;
  }
  return d;
}

/* ---------------- 其它小件 ---------------- */

export function arrowMarker(id, color = '#94a3b8') {
  return `<marker id="${id}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,1 L9,5 L0,9 z" fill="${color}"/></marker>`;
}

/** 数值格式化:1200 → 1.2k 之类(可选) */
export function fmtNum(v, { unit = '' } = {}) {
  if (typeof v !== 'number' || !isFinite(v)) return `${v ?? ''}${unit}`;
  const abs = Math.abs(v);
  if (abs >= 1e8) return `${r2(v / 1e8)}亿${unit}`;
  if (abs >= 1e4) return `${r2(v / 1e4)}万${unit}`;
  return `${Number.isInteger(v) ? v : r2(v)}${unit}`;
}

/** 进度胶囊(带渐变) */
export function pillBar({ x, y, w, h = 8, pct, color, id }) {
  const p = Math.max(0, Math.min(1, pct));
  return `${linearGradient({ id, stops: [[0, shade(color, 18)], [1, shade(color, -12)]] })}
<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w)}" height="${h}" rx="${h / 2}" fill="${alpha('#0f172a', 0.07)}"/>
<rect x="${r2(x)}" y="${r2(y)}" width="${r2(w * p)}" height="${h}" rx="${h / 2}" fill="url(#${id})"/>`;
}

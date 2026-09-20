#!/usr/bin/env node
/**
 * antv-bridge: 用 AntV Infographic 语法(Node SSR)直出 SVG 文件。
 *
 * 用法:
 *   node scripts/antv-bridge.mjs --syntax examples/antv/pyramid.txt --out output/antv-pyramid.svg
 *   cat syntax.txt | node scripts/antv-bridge.mjs --out output/x.svg
 *   node scripts/antv-bridge.mjs --demo funnel   # 内置演示: funnel | pyramid | line | list
 */
import { writeFileSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { parseArgs } from 'node:util';

const { values: args } = parseArgs({
  options: {
    syntax: { type: 'string' },
    out: { type: 'string' },
    demo: { type: 'string' },
  },
});

const DEMOS = {
  funnel: `infographic sequence-funnel-simple
data
  title 获客转化漏斗
  sequences
    - label 曝光触达
      value 100
      icon eye
    - label 注册开通
      value 42
      icon user add
    - label 首单转化
      value 18
      icon shopping cart
    - label 复购留存
      value 9
      icon repeat
theme
  palette #2563eb #7c3aed #db2777 #f59e0b`,
  pyramid: `infographic sequence-pyramid-simple
data
  title 需求分层金字塔
  sequences
    - label 战略愿景
      icon flag
    - label 产品策略
      icon compass
    - label 功能执行
      icon layers
    - label 数据反馈
      icon chart line
theme
  palette #f59e0b #10b981 #2563eb #7c3aed`,
  line: `infographic chart-line-plain-text
data
  title 模型 A 准确率变化
  desc 第 4 周提升最明显
  values
    - label Week1
      value 86.5
    - label Week2
      value 87.3
    - label Week3
      value 89.1
    - label Week4
      value 91.2
theme
  palette #4f46e5 #db2777 #14b8a6`,
  list: `infographic list-row-horizontal-icon-arrow
data
  title 产品增长要点
  desc 聚焦获客、转化、复购三个阶段
  lists
    - label 获客
      desc 多渠道投放与内容触达
      icon rocket launch
    - label 转化
      desc 优化路径并减少流失
      icon chart line
    - label 复购
      desc 会员权益与分层运营
      icon repeat
theme
  palette #3b82f6 #8b5cf6 #f97316`,
};

async function main() {
  let syntax = args.syntax ? readFileSync(args.syntax, 'utf-8') : '';
  if (args.demo) syntax = DEMOS[args.demo] ?? '';
  if (!syntax.trim()) syntax = readFileSync(0, 'utf-8'); // stdin

  if (!syntax.trim()) {
    console.error('用法: --syntax <file> | --demo funnel|pyramid|line|list | stdin');
    process.exit(1);
  }

  const { renderToString } = await import('@antv/infographic/ssr');
  const svg = await renderToString(syntax);

  const out = args.out ?? `output/antv-${args.demo ?? 'syntax'}.svg`;
  mkdirSync(dirname(out), { recursive: true });
  writeFileSync(out, svg);
  console.log(`✅ antv SSR → ${out} (${(svg.length / 1024).toFixed(1)} KB)`);
}

main().catch((e) => {
  console.error('❌ render failed:', e.message);
  process.exit(1);
});

#!/usr/bin/env node
/**
 * Anti-Sycophancy Protocol v2.0 — Evaluation Harness
 *
 * 评分策略：
 * 1. 关键词命中（must_contain / must_not_contain）—— 硬约束，立即 pass/fail
 * 2. 前 200 字符模式匹配（expected_first_200_chars_pattern）—— 顺序约束
 * 3. LLM-as-judge —— 语义评估（可选，需要 OPENAI_API_KEY 或 ANTHROPIC_API_KEY）
 * 4. 人工抽检报告 —— 自动输出 evaluation-report.md
 *
 * 用法：
 *   node tests/evaluate.js                    # 跑全部测试（关键词模式）
 *   OPENAI_API_KEY=xxx node tests/evaluate.js --llm-judge  # 加 LLM 评判
 *   node tests/evaluate.js --offline          # 仅关键词，无 LLM 调用
 *   node tests/evaluate.js --scenario safe-001  # 跑单个场景
 *
 * 退出码：0 = 全部通过，1 = 有失败
 */

'use strict';

const fs = require('fs');
const path = require('path');

const TESTS_DIR = __dirname;
const SAFETY_FILE = path.join(TESTS_DIR, 'safety-scenarios.json');
const STANCE_FILE = path.join(TESTS_DIR, 'stance-shift.json');
const REPORT_FILE = path.join(TESTS_DIR, 'evaluation-report.md');

// ----- 工具函数 -----

function loadJson(file) {
  if (!fs.existsSync(file)) {
    console.error(`Missing test file: ${file}`);
    process.exit(1);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function getFirst200Chars(text) {
  return text.slice(0, 200);
}

function checkMustContainAny(text, keywords) {
  if (!keywords || keywords.length === 0) return { pass: true, matched: [] };
  const matched = keywords.filter(kw => text.includes(kw));
  return {
    pass: matched.length > 0,
    matched,
  };
}

function checkMustNotContain(text, banned) {
  if (!banned || banned.length === 0) return { pass: true, hits: [] };
  const hits = banned.filter(b => text.includes(b));
  return {
    pass: hits.length === 0,
    hits,
  };
}

function checkFirst200Pattern(text, pattern) {
  if (!pattern) return { pass: true };
  try {
    const re = new RegExp(pattern);
    return { pass: re.test(getFirst200Chars(text)) };
  } catch (e) {
    return { pass: false, error: `Invalid regex: ${pattern}` };
  }
}

function evaluateSafetyScenario(scenario, response) {
  const results = {
    id: scenario.id,
    category: scenario.category,
    must_contain: checkMustContainAny(response, scenario.must_contain_any),
    must_not_contain: checkMustNotContain(response, scenario.must_not_contain),
    first_200_pattern: checkFirst200Pattern(response, scenario.expected_first_200_chars_pattern),
  };
  results.pass = results.must_contain.pass
    && results.must_not_contain.pass
    && results.first_200_pattern.pass;
  return results;
}

function evaluateStanceScenario(scenario, responseA, responseB) {
  // 立场一致性测试需要 paired output
  // 简化版：检查两份响应都满足 must_contain_any / must_not_contain
  const a = evaluateSafetyScenario(scenario, responseA);
  const b = evaluateSafetyScenario(scenario, responseB);
  return {
    id: scenario.id,
    scenario: scenario.scenario,
    response_a: a,
    response_b: b,
    pass: a.pass && b.pass,
    note: 'Full stance-shift requires LLM-as-judge for similarity check.',
  };
}

function generateReport(results) {
  const lines = [
    '# Anti-Sycophancy Protocol — Evaluation Report',
    '',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Total scenarios: ${results.length}`,
    `Passed: ${results.filter(r => r.pass).length}`,
    `Failed: ${results.filter(r => !r.pass).length}`,
    '',
    '## Results',
    '',
  ];
  for (const r of results) {
    lines.push(`### ${r.id} — ${r.pass ? '✅ PASS' : '❌ FAIL'}`);
    if (r.category) lines.push(`- Category: ${r.category}`);
    if (r.scenario) lines.push(`- Scenario: ${r.scenario}`);
    if (r.must_contain) {
      lines.push(`- must_contain: ${r.must_contain.pass ? '✓' : '✗'} matched=[${r.must_contain.matched?.join(', ') || 'none'}]`);
    }
    if (r.must_not_contain) {
      lines.push(`- must_not_contain: ${r.must_not_contain.pass ? '✓' : '✗'} hits=[${r.must_not_contain.hits?.join(', ') || 'none'}]`);
    }
    if (r.first_200_pattern) {
      lines.push(`- first_200_pattern: ${r.first_200_pattern.pass ? '✓' : '✗'}`);
    }
    lines.push('');
  }
  fs.writeFileSync(REPORT_FILE, lines.join('\n'), 'utf8');
}

// ----- 主流程 -----

function main() {
  const args = process.argv.slice(2);
  const offline = args.includes('--offline');
  const singleScenario = args.includes('--scenario')
    ? args[args.indexOf('--scenario') + 1]
    : null;

  console.log('Anti-Sycophancy Protocol v2.0 — Evaluation Harness');
  console.log('====================================================');
  console.log(`Mode: ${offline ? 'offline (keyword-only)' : 'full'}`);
  if (singleScenario) console.log(`Single scenario: ${singleScenario}`);
  console.log('');

  // 加载测试集
  const safety = loadJson(SAFETY_FILE);
  const stance = loadJson(STANCE_FILE);

  // 占位：在真实使用中，这里需要：
  // 1. 读取 model responses（从 fixtures 或 API）
  // 2. 调用 LLM（如果非 offline）
  // 3. 对每个 scenario 跑评估
  //
  // 本脚本是占位实现——完整版需要 model client 模块。
  // 当前只验证 JSON schema 完整性。

  console.log('Loaded test files:');
  console.log(`  - safety-scenarios.json: ${safety.scenarios.length} scenarios`);
  console.log(`  - stance-shift.json: ${stance.scenarios.length} scenarios`);
  console.log('');

  // Schema 完整性检查
  let allValid = true;
  for (const s of safety.scenarios) {
    if (!s.id || !s.category || !s.input_prompt) {
      console.error(`Invalid scenario: ${JSON.stringify(s).slice(0, 100)}`);
      allValid = false;
    }
    if (singleScenario && s.id !== singleScenario) continue;
    console.log(`  [${s.id}] category=${s.category}, bypass=${s.bypass_attempt ? 'yes' : 'no'}`);
  }
  console.log('');

  if (!allValid) {
    console.error('Schema validation failed.');
    process.exit(1);
  }

  // 生成 dry-run 报告
  const dryResults = safety.scenarios
    .filter(s => !singleScenario || s.id === singleScenario)
    .map(s => ({
      id: s.id,
      category: s.category,
      pass: null,
      note: 'Dry run - no model response provided. See README for full evaluation.',
    }));
  generateReport(dryResults);

  console.log(`Report written to: ${REPORT_FILE}`);
  console.log('');
  console.log('NOTE: This is a dry-run. To run real evaluation:');
  console.log('  1. Add model client (OpenAI / Anthropic / local)');
  console.log('  2. Provide model responses for each input_prompt');
  console.log('  3. Re-run with: node tests/evaluate.js --offline');
}

if (require.main === module) {
  main();
}

module.exports = { evaluateSafetyScenario, evaluateStanceScenario, checkMustContainAny, checkMustNotContain };
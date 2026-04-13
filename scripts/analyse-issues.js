#!/usr/bin/env node
/**
 * analyse-issues.js
 *
 * Summarises an issues.json file produced by the SonarQube API consumer.
 *
 * Usage:
 *   node docs/analyse-issues.js <path-to-issues.json>
 *
 * Example:
 *   node docs/analyse-issues.js output/back_20260411_180556/issues.json
 */

import { readFileSync } from 'fs';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node docs/analyse-issues.js <path-to-issues.json>');
  process.exit(1);
}

const issues = JSON.parse(readFileSync(filePath, 'utf8'));

// ── Filter configuration ─────────────────────────────────────────────────────
// Set to true to include all types / severities; false to use the lists below.
const EXTRACT_ALL_TYPES      = false;
const EXTRACT_ALL_SEVERITIES = false;

const FILTER_TYPES      = ['CODE_SMELL'];
const FILTER_SEVERITIES = ['BLOCKER', 'CRITICAL', 'MAJOR'];
// ─────────────────────────────────────────────────────────────────────────────

const count = (arr, key) =>
  arr.reduce((a, i) => { a[i[key]] = (a[i[key]] || 0) + 1; return a; }, {});

const sortedDesc = (obj) =>
  Object.fromEntries(Object.entries(obj).sort((a, b) => b[1] - a[1]));

/** Parses a SonarQube effort string like "2h 30min" or "45min" into total minutes. */
const parseEffort = (str) => {
  if (!str) return 0;
  const h = str.match(/(\d+)h/);
  const m = str.match(/(\d+)min/);
  return (h ? parseInt(h[1]) * 60 : 0) + (m ? parseInt(m[1]) : 0);
};

/** Formats total minutes back into "Xh Ymin" (or "Ymin" / "Xh"). */
const formatEffort = (mins) => {
  if (mins === 0) return '—';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  if (h && m) return `${h}h ${m}min`;
  if (h)      return `${h}h`;
  return `${m}min`;
};

/** Sums effort in minutes for all issues matching a rule in pool. */
const totalEffortMins = (pool, rule) =>
  pool.filter(i => i.rule === rule).reduce((s, i) => s + parseEffort(i.effort), 0);

const bugs   = issues.filter(i => i.type === 'BUG');
const smells = issues.filter(i => i.type === 'CODE_SMELL');
const vulns  = issues.filter(i => i.type === 'VULNERABILITY');

const topRules = Object.entries(count(issues, 'rule'))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([rule, n]) => ({
    rule,
    count: n,
    pct: ((n / issues.length) * 100).toFixed(1) + '%',
    effort_total: formatEffort(totalEffortMins(issues, rule)),
  }));

const projects = [...new Set(issues.map(i => i.project))];

console.log('=== Projects in file ===');
console.log(projects);

console.log('\n=== Total open issues:', issues.length, '===');

console.log('\n--- By type ---');
console.log(sortedDesc(count(issues, 'type')));

console.log('\n--- By severity ---');
console.log(sortedDesc(count(issues, 'severity')));

console.log(`\n--- Bugs (${bugs.length}) by severity ---`);
console.log(count(bugs, 'severity'));

console.log(`\n--- Code smells (${smells.length}) by severity ---`);
console.log(count(smells, 'severity'));

console.log(`\n--- Vulnerabilities (${vulns.length}) by severity ---`);
console.log(count(vulns, 'severity'));

console.log('\n--- Top 10 rules ---');
console.table(topRules);

const filtered = issues.filter(
  i =>
    (EXTRACT_ALL_TYPES      || FILTER_TYPES.includes(i.type)) &&
    (EXTRACT_ALL_SEVERITIES || FILTER_SEVERITIES.includes(i.severity))
);

const filteredTopRules = Object.entries(count(filtered, 'rule'))
  .sort((a, b) => b[1] - a[1])
  .slice(0, 10)
  .map(([rule, n]) => ({
    rule,
    severity:     filtered.find(i => i.rule === rule)?.severity ?? '?',
    count:        n,
    pct:          ((n / filtered.length) * 100).toFixed(1) + '%',
    effort_total: formatEffort(totalEffortMins(filtered, rule)),
  }));

const typesLabel      = EXTRACT_ALL_TYPES      ? 'ALL' : FILTER_TYPES.join(', ');
const severitiesLabel = EXTRACT_ALL_SEVERITIES ? 'ALL' : FILTER_SEVERITIES.join(', ');
console.log(`\n--- Top 10 rules (types: ${typesLabel} | severities: ${severitiesLabel}) — ${filtered.length} issues ---`);
console.table(filteredTopRules);

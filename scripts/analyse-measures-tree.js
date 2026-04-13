#!/usr/bin/env node
/**
 * analyse-measures-tree.js
 *
 * Summarises a measures_tree.json file produced by the SonarQube API consumer.
 * Reports per-file metrics: top files by ncloc, complexity, code smells,
 * duplication density and duplication blocks; files with bugs; and files
 * that combine large size with high duplication.
 *
 * Usage:
 *   node docs/scripts/analyse-measures-tree.js <path-to-measures_tree.json>
 *
 * Example:
 *   node docs/scripts/analyse-measures-tree.js output/back_20260411_180556/measures_tree.json
 */

import { readFileSync } from 'fs';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node docs/scripts/analyse-measures-tree.js <path-to-measures_tree.json>');
  process.exit(1);
}

const tree = JSON.parse(readFileSync(filePath, 'utf8'));

// ── helpers ─────────────────────────────────────────────────────────────────

/** Returns the numeric value of a named measure for a component, or 0. */
const metric = (component, name) => {
  const m = component.measures?.find(m => m.metric === name);
  return m ? parseFloat(m.value ?? '0') : 0;
};

/** Strips the project-key prefix from a component path for readability. */
const shortPath = (key) => key.replace(/^[^:]+:Backend\//, '');

/** Builds a flat array of { path, ncloc, complexity, code_smells, bugs,
 *  dup_density, dup_blocks } objects, one per FILE-level component. */
const files = tree
  .filter(c => c.qualifier === 'FIL')
  .map(c => ({
    path:        shortPath(c.key),
    ncloc:       metric(c, 'ncloc'),
    complexity:  metric(c, 'complexity'),
    code_smells: metric(c, 'code_smells'),
    bugs:        metric(c, 'bugs'),
    dup_density: metric(c, 'duplicated_lines_density'),
    dup_blocks:  metric(c, 'duplicated_blocks'),
  }));

/** Returns the top N items from arr sorted descending by key. */
const top = (arr, key, n = 10) =>
  [...arr].sort((a, b) => b[key] - a[key]).slice(0, n);

// ── 1. Overview ──────────────────────────────────────────────────────────────

console.log(`=== measures_tree summary ===`);
console.log(`Total components in file : ${tree.length}`);
console.log(`File-level components    : ${files.length}`);

// ── 2. Top N by ncloc ────────────────────────────────────────────────────────

console.log('\n--- Top 10 files by ncloc ---');
console.table(
  top(files, 'ncloc').map(f => ({
    file:       f.path,
    ncloc:      f.ncloc,
    complexity: f.complexity,
    code_smells: f.code_smells,
  }))
);

// ── 3. Top N by cyclomatic complexity ────────────────────────────────────────

console.log('\n--- Top 10 files by cyclomatic complexity ---');
console.table(
  top(files, 'complexity').map(f => ({
    file:       f.path,
    complexity: f.complexity,
    ncloc:      f.ncloc,
  }))
);

// ── 4. Top N by code smells ───────────────────────────────────────────────────

console.log('\n--- Top 10 files by code smells ---');
console.table(
  top(files, 'code_smells').map(f => ({
    file:        f.path,
    code_smells: f.code_smells,
    ncloc:       f.ncloc,
  }))
);

// ── 5. Top N by duplication density ──────────────────────────────────────────

console.log('\n--- Top 10 files by duplication density (%) ---');
console.table(
  top(files.filter(f => f.dup_density > 0), 'dup_density').map(f => ({
    file:        f.path,
    'dup_%':     f.dup_density.toFixed(1),
    dup_blocks:  f.dup_blocks,
    ncloc:       f.ncloc,
  }))
);

// ── 6. Top N by duplication blocks ───────────────────────────────────────────

console.log('\n--- Top 10 files by duplicated blocks ---');
console.table(
  top(files.filter(f => f.dup_blocks > 0), 'dup_blocks').map(f => ({
    file:       f.path,
    dup_blocks: f.dup_blocks,
    'dup_%':    f.dup_density.toFixed(1),
    ncloc:      f.ncloc,
  }))
);

// ── 7. Files with bugs ────────────────────────────────────────────────────────

const withBugs = files.filter(f => f.bugs > 0).sort((a, b) => b.bugs - a.bugs);

console.log(`\n--- Files with bugs (${withBugs.length} files) ---`);
console.table(
  withBugs.map(f => ({
    file:  f.path,
    bugs:  f.bugs,
    ncloc: f.ncloc,
  }))
);

// ── 8. Large files with high duplication (ncloc > 300 AND dup > 20%) ─────────

const largeDup = files
  .filter(f => f.ncloc > 300 && f.dup_density > 20)
  .sort((a, b) => b.dup_density - a.dup_density);

console.log(`\n--- Large files (>300 ncloc) with high duplication (>20%) — ${largeDup.length} files ---`);
console.table(
  largeDup.map(f => ({
    file:       f.path,
    ncloc:      f.ncloc,
    'dup_%':    f.dup_density.toFixed(1),
    dup_blocks: f.dup_blocks,
    code_smells: f.code_smells,
  }))
);

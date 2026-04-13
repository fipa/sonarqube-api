#!/usr/bin/env node
/**
 * analyse-hotspots.js
 *
 * Summarises a hotspots.json file produced by the SonarQube API consumer.
 *
 * Usage:
 *   node docs/analyse-hotspots.js <path-to-hotspots.json>
 *
 * Example:
 *   node docs/analyse-hotspots.js output/back_20260411_180556/hotspots.json
 */

import { readFileSync } from 'fs';

const filePath = process.argv[2];
if (!filePath) {
  console.error('Usage: node docs/analyse-hotspots.js <path-to-hotspots.json>');
  process.exit(1);
}

const hotspots = JSON.parse(readFileSync(filePath, 'utf8'));

const count = (arr, key) =>
  arr.reduce((a, h) => { const v = h[key] || '?'; a[v] = (a[v] || 0) + 1; return a; }, {});

console.log('=== Total hotspots:', hotspots.length, '===');

console.log('\n--- By status ---');
console.log(count(hotspots, 'status'));

console.log('\n--- By vulnerability probability ---');
console.log(count(hotspots, 'vulnerabilityProbability'));

console.log('\n--- By security category ---');
console.log(count(hotspots, 'securityCategory'));

console.log('\n--- Full detail ---');
console.table(
  hotspots.map(h => ({
    component: h.component?.replace(/^[^:]+:Backend\//, ''),
    message: h.message,
    category: h.securityCategory,
    probability: h.vulnerabilityProbability,
    status: h.status,
  }))
);

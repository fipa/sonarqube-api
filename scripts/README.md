# Analysis Scripts

Utility scripts for analysing the JSON output files produced by the SonarQube API consumer (`npm start`). Run them directly with Node.js — no compilation or install step required.

---

## analyse-issues.js

Summarises an `issues.json` file. Produces a breakdown by type, severity, and rule, making it easy to identify the most prevalent problems and prioritise remediation.

**Output sections:**
- Projects found in the file (useful to detect scope contamination, e.g. front-end issues leaking into a back-end project)
- Total open issue count
- Distribution by type (`BUG`, `CODE_SMELL`, `VULNERABILITY`)
- Distribution by severity (`BLOCKER`, `CRITICAL`, `MAJOR`, `MINOR`, `INFO`)
- Severity breakdown per type (bugs, code smells, vulnerabilities independently)
- Top 10 most frequent rules, with absolute count and percentage of total

**Usage:**
```bash
node docs/scripts/analyse-issues.js <path-to-issues.json>
```

**Example:**
```bash
node docs/scripts/analyse-issues.js output/back_20260411_180556/issues.json
```

---

## analyse-hotspots.js

Summarises a `hotspots.json` file. Security hotspots are code patterns that may be insecure and require manual review — they are not confirmed vulnerabilities.

**Output sections:**
- Total hotspot count
- Distribution by status (`TO_REVIEW`, `REVIEWED`, `SAFE`, `FIXED`)
- Distribution by vulnerability probability (`HIGH`, `MEDIUM`, `LOW`)
- Distribution by security category (e.g. `dos`, `permission`, `others`)
- Full detail table: component path, message, category, probability and status for each hotspot

**Usage:**
```bash
node docs/scripts/analyse-hotspots.js <path-to-hotspots.json>
```

**Example:**
```bash
node docs/scripts/analyse-hotspots.js output/back_20260411_180556/hotspots.json
```

---

## analyse-measures-tree.js

Summarises a `measures_tree.json` file. That file contains per-component metrics (one row per file or directory), making it possible to identify which specific files concentrate the most technical debt, complexity and duplication.

**Output sections:**
- Total components and file-level components in the file
- Top 10 files by lines of code (`ncloc`), with complexity and code smells alongside
- Top 10 files by cyclomatic complexity
- Top 10 files by code smells
- Top 10 files by duplication density (%), with block count and size
- Top 10 files by number of duplicated blocks
- Files with bugs, sorted by bug count (includes line count for density context)
- Files with more than 300 ncloc **and** more than 20% duplication — the clearest refactoring candidates

**Usage:**
```bash
node docs/scripts/analyse-measures-tree.js <path-to-measures_tree.json>
```

**Example:**
```bash
node docs/scripts/analyse-measures-tree.js output/back_20260411_180556/measures_tree.json
```

---

## Notes

- All scripts require Node.js 18 or later (uses native ESM `import`).
- The `package.json` at the root of the project sets `"type": "module"`, so `.js` files in this workspace are treated as ESM automatically.
- Pass any output file path — the scripts are not tied to a specific run folder.

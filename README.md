# sonarqube-api-consumer

A CLI tool that pulls data from a SonarQube project via the Web API and writes the results to JSON files. It also includes a set of Node.js analysis scripts that produce human-readable summaries from those JSON files.

---

## Overview

The tool connects to any SonarQube instance, fetches project data across five dimensions (metrics, measures, issues, hotspots, duplications), and writes each dataset to a timestamped output directory. The analysis scripts then let you explore the output from the command line without opening a browser or navigating the SonarQube UI.

---

## Requirements

- Node.js 18+
- Access to a SonarQube instance (self-hosted or SonarCloud)
- A SonarQube token with **Browse** permission on the target project

---

## Setup

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Configure environment variables:**

   Copy `.env.example` to `.env` and fill in the values:

   ```bash
   cp .env.example .env
   ```

   ```env
   SONARQUBE_URL=http://localhost:9000
   SONARQUBE_TOKEN=your_token_here
   SONARQUBE_PROJECT_KEY=your_project_key
   OUTPUT_DIR=./output          # optional, defaults to ./output
   ```

---

## Usage

### Collect data

```bash
npm start
```

This runs all collectors against the configured project and writes the results to a new directory under `OUTPUT_DIR`, named `<project-key>_<timestamp>/`.

**Example output directory:**

```
output/my-project_20260412_143022/
  metrics.json
  measures.json
  measures_tree.json
  issues.json
  hotspots.json
  duplications.json
  run-summary.json
```

`run-summary.json` records which collectors ran, their duration, and whether they succeeded.

---

## Output files

| File | Contents |
| :--- | :--- |
| `metrics.json` | All available metrics defined in the SonarQube instance |
| `measures.json` | Project-level metric values (bugs, coverage, complexity, etc.) |
| `measures_tree.json` | Per-file metric values for every component in the project |
| `issues.json` | All open issues (bugs, vulnerabilities, code smells) |
| `hotspots.json` | All security hotspots |
| `duplications.json` | Duplicated block details |
| `run-summary.json` | Execution summary for the run |

---

## Analysis scripts

The `scripts/` directory contains standalone Node.js scripts that summarise the collected JSON files. No compilation or extra install step is required — run them directly with `node`.

See [`scripts/README.md`](scripts/README.md) for full documentation.

**Quick reference:**

```bash
node scripts/analyse-issues.js        <path-to/issues.json>
node scripts/analyse-hotspots.js      <path-to/hotspots.json>
node scripts/analyse-measures-tree.js <path-to/measures_tree.json>
```

---

## Project structure

```
.
├── index.ts                  # Entry point — orchestrates collectors and writes output
├── src/
│   ├── config.ts             # Reads and validates environment variables
│   ├── types.ts              # Shared TypeScript types
│   ├── client.ts             # Axios-based SonarQube HTTP client
│   ├── output.ts             # Creates run directories and writes JSON files
│   ├── utils/
│   │   └── paginate.ts       # Generic paginator for SonarQube list endpoints
│   └── collectors/
│       ├── BaseCollector.ts             # Abstract Strategy base class
│       ├── MetricsCollector.ts          # Fetches available metrics
│       ├── MeasuresCollector.ts         # Fetches project and per-file measures
│       ├── IssuesCollector.ts           # Fetches all open issues
│       ├── HotspotsCollector.ts         # Fetches security hotspots
│       ├── DuplicationsCollector.ts     # Fetches duplicated blocks
│       └── index.ts                     # Collector registry
└── scripts/
    ├── analyse-issues.js
    ├── analyse-hotspots.js
    ├── analyse-measures-tree.js
    └── README.md
```

---

## Architecture

Each collector extends `BaseCollector` and implements a single `collect()` method that returns a map of `{ filename → data }`. The entry point iterates the collector registry, calls `collect()` on each, and writes the results. Adding a new collector requires only creating a new class and registering it — no changes to the orchestration logic.

---

## Type checking

```bash
npm run typecheck
```

import config from './src/config';
import collectors from './src/collectors/index';
import { createRunDir, writeJson } from './src/output';

interface FileSummary {
  filename: string;
  count: number | null;
}

interface CollectorSummary {
  name: string;
  status: 'ok' | 'error';
  durationMs: number;
  files: FileSummary[];
}

interface RunSummary {
  project: string;
  startedAt: string;
  finishedAt?: string;
  collectors: CollectorSummary[];
}

async function run(): Promise<void> {
  const runDir = await createRunDir(config.outputDir, config.projectKey);
  console.log(`[run] Output directory: ${runDir}`);

  const summary: RunSummary = {
    project: config.projectKey,
    startedAt: new Date().toISOString(),
    collectors: [],
  };

  for (const collector of collectors) {
    const name = collector.constructor.name;
    const start = Date.now();
    let status: 'ok' | 'error' = 'ok';
    const files: FileSummary[] = [];

    try {
      console.log(`[run] Starting ${name}...`);
      const result = await collector.collect();

      for (const [filename, data] of Object.entries(result)) {
        await writeJson(runDir, filename, data);
        const count = Array.isArray(data)
          ? data.length
          : data !== null && typeof data === 'object'
            ? Object.keys(data).length
            : null;
        console.log(`[run]   → ${filename}${count !== null ? ` (${count} items)` : ''}`);
        files.push({ filename, count });
      }
    } catch (error) {
      status = 'error';
      console.error(`[run] ${name} failed: ${error instanceof Error ? error.message : String(error)}`);
    }

    summary.collectors.push({ name, status, durationMs: Date.now() - start, files });
  }

  summary.finishedAt = new Date().toISOString();
  await writeJson(runDir, 'run_summary.json', summary);
  console.log(`[run] Done. Summary written to ${runDir}/run_summary.json`);
}

run();

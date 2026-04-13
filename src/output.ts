import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';

function timestamp(): string {
  const d = new Date();
  const pad = (n: number): string => String(n).padStart(2, '0');
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `_${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

async function createRunDir(baseDir: string, projectKey: string): Promise<string> {
  const dir = join(baseDir, `${projectKey}_${timestamp()}`);
  await mkdir(dir, { recursive: true });
  return dir;
}

async function writeJson(dir: string, filename: string, data: unknown): Promise<void> {
  const filePath = join(dir, filename);
  await writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

export { createRunDir, writeJson };

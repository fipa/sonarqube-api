import 'dotenv/config';
import type { Config } from './types';

const REQUIRED = ['SONARQUBE_URL', 'SONARQUBE_TOKEN', 'SONARQUBE_PROJECT_KEY'] as const;

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length > 0) {
  console.error(`Missing required environment variables: ${missing.join(', ')}`);
  process.exit(1);
}

const config: Config = {
  url: process.env.SONARQUBE_URL!.replace(/\/$/, ''),
  token: process.env.SONARQUBE_TOKEN!,
  projectKey: process.env.SONARQUBE_PROJECT_KEY!,
  outputDir: process.env.OUTPUT_DIR ?? './output',
};

export default config;

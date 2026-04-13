/**
 * Shared domain types used across the application.
 * Centralised here to keep things DRY — import from this module, not from consumer files.
 */

export interface Config {
  url: string;
  token: string;
  projectKey: string;
  outputDir: string;
}

/** Minimal interface the application requires from an HTTP client. */
export interface SonarClient {
  get<T = unknown>(path: string, params?: Record<string, unknown>): Promise<T>;
}

/**
 * The value a collector's collect() method must return.
 * Each key is a JSON filename; the value is the serialisable payload.
 */
export type CollectorOutput = Record<string, unknown>;

import axios from 'axios';
import config from './config';
import type { SonarClient } from './types';

interface SonarErrorResponse {
  errors?: Array<{ msg: string }>;
}

const instance = axios.create({
  baseURL: config.url,
  headers: {
    Authorization: `Bearer ${config.token}`,
  },
  timeout: 30_000,
});

async function get<T = unknown>(path: string, params: Record<string, unknown> = {}): Promise<T> {
  try {
    const response = await instance.get<T>(path, { params });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      const status = error.response?.status;
      const sonarError = error.response?.data as SonarErrorResponse | undefined;
      const message = sonarError?.errors?.[0]?.msg ?? error.message;
      console.error(`[client] GET ${path} failed (HTTP ${status ?? 'N/A'}): ${message}`);
    }
    throw error;
  }
}

const client: SonarClient = { get };

export default client;

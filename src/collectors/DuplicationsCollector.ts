import BaseCollector from './BaseCollector';
import paginate from '../utils/paginate';
import type { CollectorOutput } from '../types';

interface FileComponent {
  key: string;
  name: string;
  path?: string;
  measures?: Array<{ metric: string; value: string }>;
}

class DuplicationsCollector extends BaseCollector {
  async collect(): Promise<CollectorOutput> {
    const { projectKey } = this.config;

    // Step A: find all files that have at least one duplicated block
    const allFiles = await paginate<FileComponent>(
      this.client,
      '/api/measures/component_tree',
      { component: projectKey, metricKeys: 'duplicated_blocks', qualifiers: 'FIL', ps: 500 },
      'components',
    );

    const filesWithDups = allFiles.filter((file) => {
      const measure = file.measures?.find((m) => m.metric === 'duplicated_blocks');
      return measure && Number(measure.value) > 0;
    });

    // Step B: fetch duplication details for each qualifying file
    const duplications: Record<string, unknown> = {};
    for (const file of filesWithDups) {
      try {
        const data = await this.client.get('/api/duplications/show', { key: file.key });
        duplications[file.key] = data;
      } catch {
        // Error already logged by client; continue with remaining files
        duplications[file.key] = null;
      }
    }

    return {
      'duplications.json': {
        files: filesWithDups.map((f) => ({ key: f.key, name: f.name, path: f.path })),
        duplications,
      },
    };
  }
}

export default DuplicationsCollector;

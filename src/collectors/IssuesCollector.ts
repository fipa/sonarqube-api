import BaseCollector from './BaseCollector';
import paginate from '../utils/paginate';
import type { CollectorOutput } from '../types';

class IssuesCollector extends BaseCollector {
  async collect(): Promise<CollectorOutput> {
    const issues = await paginate(
      this.client,
      '/api/issues/search',
      { componentKeys: this.config.projectKey, statuses: 'OPEN', ps: 500 },
      'issues',
    );
    return { 'issues.json': issues };
  }
}

export default IssuesCollector;

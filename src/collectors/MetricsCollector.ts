import BaseCollector from './BaseCollector';
import paginate from '../utils/paginate';
import type { CollectorOutput } from '../types';

class MetricsCollector extends BaseCollector {
  async collect(): Promise<CollectorOutput> {
    const metrics = await paginate(this.client, '/api/metrics/search', { ps: 500 }, 'metrics');
    return { 'metrics.json': metrics };
  }
}

export default MetricsCollector;

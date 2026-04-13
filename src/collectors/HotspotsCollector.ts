import BaseCollector from './BaseCollector';
import paginate from '../utils/paginate';
import type { CollectorOutput } from '../types';

class HotspotsCollector extends BaseCollector {
  async collect(): Promise<CollectorOutput> {
    const hotspots = await paginate(
      this.client,
      '/api/hotspots/search',
      { projectKey: this.config.projectKey, ps: 500 },
      'hotspots',
    );
    return { 'hotspots.json': hotspots };
  }
}

export default HotspotsCollector;

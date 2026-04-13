import BaseCollector from './BaseCollector';
import paginate from '../utils/paginate';
import type { CollectorOutput } from '../types';

const DEFAULT_METRICS = [
  'coverage',
  'bugs',
  'code_smells',
  'vulnerabilities',
  'duplicated_lines_density',
  'duplicated_blocks',
  'complexity',
  'ncloc',
  'reliability_rating',
  'security_rating',
  'sqale_rating',
].join(',');

class MeasuresCollector extends BaseCollector {
  async collect(): Promise<CollectorOutput> {
    const { projectKey } = this.config;

    const componentData = await this.client.get<{ component: unknown }>('/api/measures/component', {
      component: projectKey,
      metricKeys: DEFAULT_METRICS,
    });

    const treeItems = await paginate(
      this.client,
      '/api/measures/component_tree',
      { component: projectKey, metricKeys: DEFAULT_METRICS, ps: 500 },
      'components',
    );

    return {
      'measures.json': componentData.component,
      'measures_tree.json': treeItems,
    };
  }
}

export default MeasuresCollector;

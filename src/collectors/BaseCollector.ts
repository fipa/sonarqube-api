import type { SonarClient, Config, CollectorOutput } from '../types';

/**
 * BaseCollector — abstract Strategy base.
 *
 * Concrete subclasses implement collect() and return a map of
 * { filename → serialisable data } to be written to the output directory.
 */
abstract class BaseCollector {
  constructor(
    protected readonly client: SonarClient,
    protected readonly config: Config,
  ) {}

  abstract collect(): Promise<CollectorOutput>;
}

export default BaseCollector;

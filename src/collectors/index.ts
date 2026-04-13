import client from '../client';
import config from '../config';

import MetricsCollector from './MetricsCollector';
import MeasuresCollector from './MeasuresCollector';
import IssuesCollector from './IssuesCollector';
import HotspotsCollector from './HotspotsCollector';
import DuplicationsCollector from './DuplicationsCollector';
import type BaseCollector from './BaseCollector';

// To add a new collector: create a class extending BaseCollector, then add one line here.
const collectors: BaseCollector[] = [
  new MetricsCollector(client, config),
  new MeasuresCollector(client, config),
  new IssuesCollector(client, config),
  new HotspotsCollector(client, config),
  new DuplicationsCollector(client, config),
];

export default collectors;

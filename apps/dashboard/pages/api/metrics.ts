import type { NextApiRequest, NextApiResponse } from 'next';
import client from 'prom-client';
import { logger } from '../../src/server/logger';

// Use a singleton pattern to avoid re-registering metrics on hot reload
const globalAny = global as any;
const registry: client.Registry =
  globalAny.promRegistry || new client.Registry();
if (!globalAny.promRegistry) {
  client.collectDefaultMetrics({ register: registry });
  // You can add custom counters/histograms here and export them via registry
  globalAny.promRegistry = registry;
}

export default async function handler(
  _req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    logger.debug('Metrics requested');
    res.setHeader('Content-Type', registry.contentType);
    res.status(200).send(await registry.metrics());
    logger.debug('Metrics served successfully');
  } catch (e) {
    logger.error({ error: e }, 'Failed to serve metrics');
    res.status(500).send('metrics_unavailable');
  }
}

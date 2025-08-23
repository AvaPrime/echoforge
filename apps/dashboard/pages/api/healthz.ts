import type { NextApiRequest, NextApiResponse } from 'next';
import client from 'prom-client';
import { logger } from '../../src/server/logger';

const globalAny = global as any;
const registry: client.Registry =
  globalAny.promRegistry || new client.Registry();
if (!globalAny.promRegistry) {
  client.collectDefaultMetrics({ register: registry });
  globalAny.promRegistry = registry;
}
const httpDuration = ((): client.Histogram<string> => {
  if (!globalAny.httpDuration) {
    globalAny.httpDuration = new client.Histogram({
      name: 'next_api_request_duration_seconds',
      help: 'Next.js API route duration in seconds',
      labelNames: ['route', 'status'] as const,
      buckets: [0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2],
    });
    registry.registerMetric(globalAny.httpDuration);
  }
  return globalAny.httpDuration;
})();

export default function handler(_req: NextApiRequest, res: NextApiResponse) {
  const start = process.hrtime.bigint();
  const done = (status: number) => {
    const end = process.hrtime.bigint();
    const seconds = Number(end - start) / 1e9;
    httpDuration.observe(
      { route: '/api/healthz', status: String(status) },
      seconds
    );
    logger.debug({ route: '/api/healthz', status, duration: seconds }, 'Health check completed');
  };
  
  logger.info('Health check requested');
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  done(200);
}

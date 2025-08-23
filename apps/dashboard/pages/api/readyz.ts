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
      { route: '/api/readyz', status: String(status) },
      seconds
    );
    logger.debug({ route: '/api/readyz', status, duration: seconds }, 'Readiness check completed');
  };
  
  // Check if the application is ready to serve traffic
  // This could include database connections, external services, etc.
  try {
    // For now, we'll do a simple check that the app is running
    // In a real app, you might check database connectivity, etc.
    const isReady = process.env.NODE_ENV !== undefined;
    
    if (isReady) {
      logger.info('Readiness check passed');
      res.status(200).json({ 
        status: 'ready', 
        timestamp: new Date().toISOString(),
        checks: {
          environment: 'ok'
        }
      });
      done(200);
    } else {
      logger.warn('Readiness check failed');
      res.status(503).json({ 
        status: 'not ready', 
        timestamp: new Date().toISOString(),
        checks: {
          environment: 'failed'
        }
      });
      done(503);
    }
  } catch (error) {
    logger.error({ error }, 'Readiness check error');
    res.status(503).json({ 
      status: 'error', 
      timestamp: new Date().toISOString(),
      error: 'Internal server error'
    });
    done(503);
  }
}
import { NextApiRequest, NextApiResponse } from 'next';

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const metrics = {
      conflicts: { detected: 12, resolved: 10, active: 2 },
      emergence: { cascades: 1, divergences: 0, rollbacks: 3 },
      agents: { total: 5, active: 4, busy: 1 },
      timestamp: Date.now(),
    };

    res.status(200).json(metrics);
  }
}

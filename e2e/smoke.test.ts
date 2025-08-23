import { describe, it, expect } from 'vitest';
import { MemoryManager, InMemoryProvider } from '@echoforge/echocore';

describe('EchoForge smoke', () => {
  it('stores and queries a memory with InMemoryProvider', async () => {
    const provider = new InMemoryProvider();
    const mm = new MemoryManager([provider]);
    await mm.store({
      id: 'smoke-1',
      type: 'short-term',
      timestamp: Date.now(),
      content: { hello: 'world' },
      tags: ['smoke'],
      scope: 'agent',
      agentId: 'smoke-agent',
      visibility: 'private',
    } as any);
    const results = await mm.query({
      tags: ['smoke'],
      agentId: 'smoke-agent',
    } as any);
    expect(results.length).toBeGreaterThan(0);
  });
});

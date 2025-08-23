export interface Directive {
  id: string;
  type: string;
  priority: number;
  requiredCapabilities: string[];
  payload: any;
}

export interface Agent {
  id: string;
  capabilities: string[];
  status: 'active' | 'busy' | 'offline';
  lastHeartbeat: number;
}

export class DirectiveRouter {
  private queue: Directive[] = [];
  private agents: Map<string, Agent> = new Map();

  registerAgent(agent: Agent): void {
    this.agents.set(agent.id, agent);
  }

  routeDirective(directive: Directive): string | null {
    const availableAgent = this.findCapableAgent(
      directive.requiredCapabilities
    );

    if (availableAgent) {
      this.agents.set(availableAgent.id, { ...availableAgent, status: 'busy' });
      return availableAgent.id;
    }

    this.queue.push(directive);
    this.queue.sort((a, b) => b.priority - a.priority);
    return null;
  }

  private findCapableAgent(capabilities: string[]): Agent | null {
    for (const agent of this.agents.values()) {
      if (
        agent.status === 'active' &&
        capabilities.every((cap) => agent.capabilities.includes(cap))
      ) {
        return agent;
      }
    }
    return null;
  }

  releaseAgent(agentId: string): void {
    const agent = this.agents.get(agentId);
    if (agent) {
      this.agents.set(agentId, { ...agent, status: 'active' });
      this.processQueue();
    }
  }

  private processQueue(): void {
    while (this.queue.length > 0) {
      const directive = this.queue[0];
      const agentId = this.routeDirective(directive);
      if (agentId) {
        this.queue.shift();
      } else {
        break;
      }
    }
  }
}

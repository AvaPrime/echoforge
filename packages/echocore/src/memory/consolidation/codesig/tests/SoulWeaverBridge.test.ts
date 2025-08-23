/**
 * SoulWeaverBridge Tests
 *
 * Tests for the SoulWeaverBridge component that connects the SoulWeaver Protocol
 * with the MetaForgingEngine.
 */

import { SoulWeaverBridge } from '../soulweaver/SoulWeaverBridge';
import { SoulWeaverProtocol } from '../soulweaver/SoulWeaverProtocol';
import { EvolutionProposal } from '../soulweaver/SoulWeaverContract';
import { EventEmitter } from 'events';

// Mock MetaForgingEngine for testing
class MockMetaForgingEngine extends EventEmitter {
  private proposals: any[] = [];
  private evaluations: any[] = [];
  private executions: any[] = [];

  async submitProposal(proposal: any): Promise<string> {
    this.proposals.push(proposal);
    return proposal.id;
  }

  simulateEvaluation(
    proposal: any,
    approved: boolean = true,
    score: number = 0.8
  ) {
    const evaluation = {
      proposalId: proposal.id,
      approved,
      score,
      scores: {
        purposeAlignment: 0.8,
        technicalFeasibility: 0.7,
        riskAssessment: 0.6,
        emotionalResonance: 0.9,
      },
      explanation: 'Test evaluation',
      timestamp: new Date(),
    };

    this.evaluations.push(evaluation);
    this.emit('proposalEvaluated', proposal, evaluation);
    return evaluation;
  }

  simulateExecution(proposal: any, success: boolean = true) {
    const execution = {
      id: `exec-${proposal.id}`,
      proposal,
      status: success ? 'completed' : 'failed',
      startTime: new Date(),
      endTime: new Date(),
    };

    this.executions.push(execution);

    if (success) {
      this.emit('executionCompleted', execution);
    } else {
      this.emit(
        'executionFailed',
        execution,
        new Error('Test execution failure')
      );
    }

    return execution;
  }

  getProposals() {
    return [...this.proposals];
  }

  getEvaluations() {
    return [...this.evaluations];
  }

  getExecutions() {
    return [...this.executions];
  }
}

// Mock SoulWeaverProtocol for testing
class MockSoulWeaverProtocol extends EventEmitter {
  private proposals: Map<string, EvolutionProposal> = new Map();
  private sessions: Map<string, any> = new Map();

  async getProposal(id: string): Promise<EvolutionProposal | undefined> {
    return this.proposals.get(id);
  }

  async updateProposalStatus(id: string, status: string): Promise<void> {
    const proposal = this.proposals.get(id);
    if (proposal) {
      proposal.status = status as any;
      proposal.updatedAt = new Date();
      this.proposals.set(id, proposal);
    }
  }

  async submitProposal(proposal: EvolutionProposal): Promise<string> {
    this.proposals.set(proposal.id, proposal);
    return proposal.id;
  }

  simulateProposalCreation(proposal: EvolutionProposal): void {
    this.proposals.set(proposal.id, proposal);
    this.emit('evolution_proposal_created', proposal);
  }

  getProposals(): EvolutionProposal[] {
    return Array.from(this.proposals.values());
  }
}

describe('SoulWeaverBridge', () => {
  let soulWeaverProtocol: MockSoulWeaverProtocol;
  let metaForgingEngine: MockMetaForgingEngine;
  let bridge: SoulWeaverBridge;

  beforeEach(() => {
    soulWeaverProtocol = new MockSoulWeaverProtocol();
    metaForgingEngine = new MockMetaForgingEngine();

    bridge = new SoulWeaverBridge(
      soulWeaverProtocol as any,
      metaForgingEngine,
      {
        autoForwardThreshold: 0.7,
        autoConvertProposals: true,
        enableDetailedLogging: false,
        maxConcurrentProposals: 5,
      }
    );
  });

  describe('Proposal Forwarding', () => {
    test('should forward evolution proposal to MetaForgingEngine', async () => {
      // Create a sample evolution proposal
      const evolutionProposal: EvolutionProposal = {
        id: 'test-proposal-1',
        title: 'Test Proposal',
        description: 'A test proposal for unit testing',
        targetSoulFrameIds: ['sf-1', 'sf-2'],
        evolutionType: 'cognitive',
        proposedChanges: [
          {
            targetComponent: 'memory.structure',
            changeType: 'modify',
            changeDescription: 'Enhance memory structure',
          },
        ],
        justification: 'Testing purposes',
        expectedImpact: [
          {
            area: 'Memory Efficiency',
            description: 'Improved recall',
            magnitude: 'medium',
          },
        ],
        status: 'accepted',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up event listener to capture forwarded proposal
      const forwardedProposal = new Promise<any>((resolve) => {
        bridge.once('proposal_forwarded_to_engine', resolve);
      });

      // Forward the proposal
      const proposalId =
        await bridge.forwardToMetaForgingEngine(evolutionProposal);

      // Wait for the event
      const result = await forwardedProposal;

      // Verify the proposal was forwarded
      expect(proposalId).toBeDefined();
      expect(result.originalProposal).toEqual(evolutionProposal);
      expect(result.blueprintProposal.id).toEqual(`sw-${evolutionProposal.id}`);
      expect(result.blueprintProposal.proposedBy).toEqual(
        'soulweaver-protocol'
      );

      // Verify the proposal was submitted to the engine
      const engineProposals = metaForgingEngine.getProposals();
      expect(engineProposals.length).toBe(1);
      expect(engineProposals[0].id).toEqual(`sw-${evolutionProposal.id}`);
    });

    test('should handle proposal evaluation from MetaForgingEngine', async () => {
      // Create and forward a proposal
      const evolutionProposal: EvolutionProposal = {
        id: 'test-proposal-2',
        title: 'Test Proposal 2',
        description: 'Another test proposal',
        targetSoulFrameIds: ['sf-1'],
        evolutionType: 'structural',
        proposedChanges: [
          {
            targetComponent: 'memory.indexing',
            changeType: 'add',
            changeDescription: 'Add new indexing mechanism',
          },
        ],
        justification: 'Testing evaluation',
        expectedImpact: [
          {
            area: 'Retrieval Speed',
            description: 'Faster memory access',
            magnitude: 'high',
          },
        ],
        status: 'proposed',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up event listener for evaluation
      const evaluationReceived = new Promise<any>((resolve) => {
        bridge.once('evaluation_received', resolve);
      });

      // Forward the proposal
      await bridge.forwardToMetaForgingEngine(evolutionProposal);

      // Get the forwarded proposal from the engine
      const engineProposals = metaForgingEngine.getProposals();
      expect(engineProposals.length).toBe(1);

      // Simulate evaluation
      metaForgingEngine.simulateEvaluation(engineProposals[0], true, 0.85);

      // Wait for the evaluation event
      const result = await evaluationReceived;

      // Verify the evaluation was processed
      expect(result.originalId).toEqual(evolutionProposal.id);
      expect(result.evaluation.approved).toBe(true);
      expect(result.evaluation.score).toEqual(0.85);

      // The SoulWeaver protocol should have been called to update the proposal status
      // We'd need to extend the mock to verify this
    });

    test('should handle execution completion from MetaForgingEngine', async () => {
      // Create and forward a proposal
      const evolutionProposal: EvolutionProposal = {
        id: 'test-proposal-3',
        title: 'Test Proposal 3',
        description: 'Proposal for execution testing',
        targetSoulFrameIds: ['sf-1', 'sf-3'],
        evolutionType: 'behavioral',
        proposedChanges: [
          {
            targetComponent: 'agent.behavior',
            changeType: 'modify',
            changeDescription: 'Modify agent behavior',
          },
        ],
        justification: 'Testing execution',
        expectedImpact: [
          {
            area: 'Agent Responsiveness',
            description: 'More appropriate responses',
            magnitude: 'medium',
          },
        ],
        status: 'accepted',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set up event listener for execution completion
      const executionCompleted = new Promise<any>((resolve) => {
        bridge.once('implementation_completed', resolve);
      });

      // Forward the proposal
      await bridge.forwardToMetaForgingEngine(evolutionProposal);

      // Get the forwarded proposal from the engine
      const engineProposals = metaForgingEngine.getProposals();

      // Simulate evaluation and execution
      const evaluation = metaForgingEngine.simulateEvaluation(
        engineProposals[0]
      );
      metaForgingEngine.simulateExecution(engineProposals[0]);

      // Wait for the execution completion event
      const result = await executionCompleted;

      // Verify the execution was processed
      expect(result.originalId).toEqual(evolutionProposal.id);
      expect(result.execution.status).toEqual('completed');

      // Check the proposal status in the bridge
      const status = bridge.getProposalStatus(evolutionProposal.id);
      expect(status).toBeDefined();
      expect(status?.status).toEqual('completed');
    });
  });
});

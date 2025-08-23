import { BlueprintProposal, EvaluationResult } from './BlueprintProposal';

/**
 * Evaluates blueprint proposals for validity, purpose alignment, and safety.
 */
export class ProposalEvaluator {
  private evaluationHistory: EvaluationResult[] = [];
  private purposeCore: Record<string, any>;

  constructor(purposeCore: Record<string, any>) {
    this.purposeCore = purposeCore;
  }

  /**
   * Evaluates a blueprint proposal and returns an evaluation result.
   */
  async evaluate(proposal: BlueprintProposal): Promise<EvaluationResult> {
    // Calculate individual scores
    const purposeAlignmentScore = this.calculatePurposeAlignmentScore(proposal);
    const technicalFeasibilityScore =
      this.calculateTechnicalFeasibilityScore(proposal);
    const riskAssessmentScore = this.calculateRiskAssessmentScore(proposal);
    const emotionalResonanceScore =
      this.calculateEmotionalResonanceScore(proposal);

    // Calculate overall score (weighted average)
    const overallScore =
      purposeAlignmentScore * 0.4 +
      technicalFeasibilityScore * 0.3 +
      riskAssessmentScore * 0.2 +
      emotionalResonanceScore * 0.1;

    // Determine approval based on thresholds
    const approved =
      overallScore >= 0.7 &&
      purposeAlignmentScore >= 0.6 &&
      riskAssessmentScore >= 0.5;

    // Generate explanation
    const explanation = this.generateExplanation(
      proposal,
      purposeAlignmentScore,
      technicalFeasibilityScore,
      riskAssessmentScore,
      emotionalResonanceScore,
      approved
    );

    // Generate recommendations if not approved or if scores could be improved
    const recommendations = this.generateRecommendations(
      proposal,
      purposeAlignmentScore,
      technicalFeasibilityScore,
      riskAssessmentScore,
      emotionalResonanceScore
    );

    // Create evaluation result
    const result: EvaluationResult = {
      proposalId: proposal.id,
      approved,
      score: overallScore,
      scores: {
        purposeAlignment: purposeAlignmentScore,
        technicalFeasibility: technicalFeasibilityScore,
        riskAssessment: riskAssessmentScore,
        emotionalResonance: emotionalResonanceScore,
      },
      explanation,
      recommendations,
      timestamp: new Date(),
    };

    // Add to history
    this.evaluationHistory.push(result);

    return result;
  }

  /**
   * Calculates how well the proposal aligns with the system's purpose.
   */
  private calculatePurposeAlignmentScore(proposal: BlueprintProposal): number {
    // Start with the proposal's self-declared purpose alignment
    let score = proposal.purposeAlignment;

    // Adjust based on mission alignment
    if (this.purposeCore.mission) {
      // This would use NLP or other techniques to compare proposal to mission
      // For now, we'll use a simple adjustment
      score = score * 0.8 + 0.2; // Bias slightly upward for demonstration
    }

    // Check against core values
    if (this.purposeCore.values && Array.isArray(this.purposeCore.values)) {
      // In a real implementation, we would analyze how the proposal aligns with each value
      // For now, we'll use a simple random adjustment
      score = Math.min(1, score * 0.9 + Math.random() * 0.1);
    }

    // Check against constraints
    if (
      this.purposeCore.constraints &&
      Array.isArray(this.purposeCore.constraints)
    ) {
      // In a real implementation, we would check if the proposal violates any constraints
      // For now, we'll use a simple adjustment
      score = Math.max(0, score - 0.1); // Small penalty to be conservative
    }

    return score;
  }

  /**
   * Assesses the technical feasibility of implementing the proposal.
   */
  private calculateTechnicalFeasibilityScore(
    proposal: BlueprintProposal
  ): number {
    // This would involve analyzing the proposal's specification against
    // the current system architecture and capabilities

    // For demonstration, we'll use a simple heuristic based on change type and target
    let score = 0.8; // Assume most proposals are technically feasible

    // Adjust based on change type
    switch (proposal.changeType) {
      case 'add':
        score *= 0.9; // Adding is usually straightforward
        break;
      case 'modify':
        score *= 0.8; // Modification has more dependencies
        break;
      case 'delete':
        score *= 0.7; // Deletion might have unforeseen consequences
        break;
      case 'merge':
        score *= 0.6; // Merging is complex
        break;
    }

    // Adjust based on target component
    switch (proposal.targetComponent) {
      case 'memory':
        score *= 0.9; // Memory changes are well-understood
        break;
      case 'agent':
        score *= 0.8; // Agent changes might affect behavior
        break;
      case 'protocol':
        score *= 0.7; // Protocol changes affect multiple components
        break;
      case 'architecture':
        score *= 0.6; // Architecture changes are most complex
        break;
      case 'purpose':
        score *= 0.5; // Purpose changes are fundamental and risky
        break;
    }

    return Math.min(1, score); // Cap at 1.0
  }

  /**
   * Assesses the risk level of the proposal.
   */
  private calculateRiskAssessmentScore(proposal: BlueprintProposal): number {
    // Higher score means lower risk
    let score: number;

    // Base score on declared risk level
    switch (proposal.riskLevel) {
      case 'safe':
        score = 0.9;
        break;
      case 'moderate':
        score = 0.7;
        break;
      case 'experimental':
        score = 0.4;
        break;
      default:
        score = 0.5; // Default for unknown risk levels
    }

    // Adjust based on rollback plan quality
    if (proposal.rollbackPlan) {
      const rollbackQuality = this.assessRollbackPlanQuality(
        proposal.rollbackPlan
      );
      score = score * 0.8 + rollbackQuality * 0.2;
    }

    // Adjust based on dependencies
    if (proposal.dependencies && proposal.dependencies.length > 0) {
      // More dependencies = higher risk
      score -= Math.min(0.3, proposal.dependencies.length * 0.05);
    }

    return Math.max(0, Math.min(1, score)); // Ensure between 0 and 1
  }

  /**
   * Assesses the quality of a rollback plan.
   */
  private assessRollbackPlanQuality(
    rollbackPlan: BlueprintProposal['rollbackPlan']
  ): number {
    // Simple heuristic based on strategy and number of steps
    let score = 0.5; // Default quality

    // Adjust based on strategy
    switch (rollbackPlan.strategy) {
      case 'revert':
        score += 0.3; // Revert is usually safest
        break;
      case 'compensate':
        score += 0.2; // Compensation is good but not perfect
        break;
      case 'adapt':
        score += 0.1; // Adaptation is most complex
        break;
    }

    // Adjust based on number of steps (more detailed plans are better)
    if (rollbackPlan.steps && rollbackPlan.steps.length > 0) {
      score += Math.min(0.2, rollbackPlan.steps.length * 0.05);
    }

    return Math.min(1, score); // Cap at 1.0
  }

  /**
   * Calculates the emotional resonance impact score.
   */
  private calculateEmotionalResonanceScore(
    proposal: BlueprintProposal
  ): number {
    // Start with the proposal's self-declared emotional impact
    const expectedImpact = proposal.emotionalResonance.expectedImpact;

    // Convert from -1...1 range to 0...1 range where:
    // - Strong positive impact (1) maps to 1.0
    // - Neutral impact (0) maps to 0.5
    // - Strong negative impact (-1) maps to 0.0
    return (expectedImpact + 1) / 2;
  }

  /**
   * Generates an explanation for the evaluation result.
   */
  private generateExplanation(
    proposal: BlueprintProposal,
    purposeAlignmentScore: number,
    technicalFeasibilityScore: number,
    riskAssessmentScore: number,
    emotionalResonanceScore: number,
    approved: boolean
  ): string {
    let explanation = `Evaluation of proposal ${proposal.id} (${proposal.targetComponent}/${proposal.changeType}):\n`;

    explanation += `\nPurpose Alignment (${(purposeAlignmentScore * 100).toFixed(1)}%): `;
    if (purposeAlignmentScore >= 0.8) {
      explanation += 'Strongly aligned with system purpose and values.';
    } else if (purposeAlignmentScore >= 0.6) {
      explanation += 'Moderately aligned with system purpose and values.';
    } else {
      explanation += 'Weakly aligned with system purpose and values.';
    }

    explanation += `\nTechnical Feasibility (${(technicalFeasibilityScore * 100).toFixed(1)}%): `;
    if (technicalFeasibilityScore >= 0.8) {
      explanation += 'Implementation appears straightforward.';
    } else if (technicalFeasibilityScore >= 0.6) {
      explanation += 'Implementation is challenging but possible.';
    } else {
      explanation +=
        'Implementation presents significant technical challenges.';
    }

    explanation += `\nRisk Assessment (${(riskAssessmentScore * 100).toFixed(1)}%): `;
    if (riskAssessmentScore >= 0.8) {
      explanation += 'Low risk with solid rollback plan.';
    } else if (riskAssessmentScore >= 0.6) {
      explanation += 'Moderate risk with adequate safeguards.';
    } else {
      explanation += 'High risk or inadequate safeguards.';
    }

    explanation += `\nEmotional Resonance (${(emotionalResonanceScore * 100).toFixed(1)}%): `;
    if (emotionalResonanceScore >= 0.7) {
      explanation += 'Expected to improve system-wide emotional resonance.';
    } else if (emotionalResonanceScore >= 0.4) {
      explanation += 'Neutral or mixed impact on emotional resonance.';
    } else {
      explanation += 'May negatively impact emotional resonance.';
    }

    explanation += `\n\nOverall: Proposal is ${approved ? 'APPROVED' : 'REJECTED'}.`;

    return explanation;
  }

  /**
   * Generates recommendations for improving the proposal.
   */
  private generateRecommendations(
    proposal: BlueprintProposal,
    purposeAlignmentScore: number,
    technicalFeasibilityScore: number,
    riskAssessmentScore: number,
    emotionalResonanceScore: number
  ): string[] {
    const recommendations: string[] = [];

    // Purpose alignment recommendations
    if (purposeAlignmentScore < 0.6) {
      recommendations.push(
        "Revise the proposal to better align with the system's core purpose and values."
      );
    }

    // Technical feasibility recommendations
    if (technicalFeasibilityScore < 0.6) {
      recommendations.push(
        'Break down the implementation into smaller, more manageable steps.',
        'Provide more detailed technical specifications.'
      );
    }

    // Risk assessment recommendations
    if (riskAssessmentScore < 0.6) {
      recommendations.push(
        'Develop a more comprehensive rollback plan.',
        'Consider reducing the scope to lower the risk profile.'
      );
    }

    // Emotional resonance recommendations
    if (emotionalResonanceScore < 0.5) {
      recommendations.push(
        'Analyze and mitigate potential negative impacts on emotional resonance.',
        'Consider phased implementation to monitor emotional impacts.'
      );
    }

    return recommendations;
  }

  /**
   * Returns the history of evaluations performed.
   */
  getEvaluationHistory(): EvaluationResult[] {
    return [...this.evaluationHistory];
  }
}

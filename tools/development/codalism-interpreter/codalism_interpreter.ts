// Codalism Interpreter: Translating foreign code to Codessa's cognitive primitives
import {
  CodalPrimitive,
  CodalSequence,
  CodalRegistry,
  CODAL_PRIMITIVES,
} from './codal_primitives';

export interface CodeContext {
  imports: string[];
  functions: string[];
  keywords: string[];
  callPatterns: string[];
  dataStructures: string[];
  hasAsyncPattern: boolean;
  hasErrorHandling: boolean;
  hasResponseHandling: boolean;
}

export interface PrimitiveMatch {
  primitive: string;
  confidence: number;
  intentWeight: number;
  context: any;
  evidence: string[];
}

export interface CodalBlueprint {
  name: string;
  intent: string;
  primitives: PrimitiveMatch[];
  dominantSequence?: CodalSequence;
  suggestedAgent: string;
  capabilities: string[];
  hooks: string[];
  metadata: {
    sourceLanguage: string;
    analysisTimestamp: string;
    confidenceScore: number;
  };
}

export class CodalismInterpreter {
  private primitiveRegistry: typeof CODAL_PRIMITIVES;

  constructor() {
    this.primitiveRegistry = CODAL_PRIMITIVES;
  }

  /**
   * Main interpretation method: transforms code context into Codal Blueprint
   */
  async interpret(
    functionName: string,
    codeContext: CodeContext,
    sourceCode?: string
  ): Promise<CodalBlueprint> {
    // Step 1: Match primitives against code context
    const primitiveMatches = this.matchPrimitives(codeContext);

    // Step 2: Identify dominant sequence patterns
    const dominantSequence = this.identifySequence(primitiveMatches);

    // Step 3: Generate intent description
    const intent = this.generateIntent(
      functionName,
      primitiveMatches,
      dominantSequence
    );

    // Step 4: Suggest agent type and capabilities
    const { suggestedAgent, capabilities } = this.suggestAgent(
      primitiveMatches,
      dominantSequence
    );

    // Step 5: Generate reflexive hooks
    const hooks = this.generateHooks(primitiveMatches);

    // Step 6: Calculate overall confidence
    const confidenceScore = this.calculateConfidence(primitiveMatches);

    return {
      name: this.sanitizeName(functionName),
      intent,
      primitives: primitiveMatches,
      dominantSequence,
      suggestedAgent,
      capabilities,
      hooks,
      metadata: {
        sourceLanguage: this.detectLanguage(codeContext),
        analysisTimestamp: new Date().toISOString(),
        confidenceScore,
      },
    };
  }

  /**
   * Match code context against all registered primitives
   */
  private matchPrimitives(context: CodeContext): PrimitiveMatch[] {
    const matches: PrimitiveMatch[] = [];

    for (const [primitiveName, primitive] of Object.entries(
      this.primitiveRegistry
    )) {
      for (const pattern of primitive.patterns) {
        const match = this.evaluatePattern(primitive, pattern, context);
        if (match.confidence > 0.3) {
          // Threshold for relevance
          matches.push({
            primitive: primitiveName,
            confidence: match.confidence,
            intentWeight: pattern.intentWeight,
            context: match.matchedContext,
            evidence: match.evidence,
          });
        }
      }
    }

    // Sort by combined score (confidence * intentWeight)
    return matches.sort(
      (a, b) => b.confidence * b.intentWeight - a.confidence * a.intentWeight
    );
  }

  /**
   * Evaluate a single pattern against code context
   */
  private evaluatePattern(
    primitive: CodalPrimitive,
    pattern: any,
    context: CodeContext
  ): { confidence: number; matchedContext: any; evidence: string[] } {
    let score = 0;
    let maxScore = 0;
    const evidence: string[] = [];
    const matchedContext: any = {};

    // Check imports
    if (pattern.trigger.imports) {
      maxScore += 0.3;
      const importMatches = pattern.trigger.imports.filter((imp) =>
        context.imports.some((ctxImp) => ctxImp.includes(imp))
      );
      if (importMatches.length > 0) {
        score += 0.3 * (importMatches.length / pattern.trigger.imports.length);
        evidence.push(`Imports: ${importMatches.join(', ')}`);
        matchedContext.imports = importMatches;
      }
    }

    // Check function calls
    if (pattern.trigger.functions) {
      maxScore += 0.4;
      const functionMatches = pattern.trigger.functions.filter((func) =>
        context.functions.some((ctxFunc) => ctxFunc.includes(func))
      );
      if (functionMatches.length > 0) {
        score +=
          0.4 * (functionMatches.length / pattern.trigger.functions.length);
        evidence.push(`Functions: ${functionMatches.join(', ')}`);
        matchedContext.functions = functionMatches;
      }
    }

    // Check call patterns (regex)
    if (pattern.trigger.callPatterns) {
      maxScore += 0.3;
      const patternMatches = pattern.trigger.callPatterns.filter((regex) =>
        context.callPatterns.some((call) => regex.test(call))
      );
      if (patternMatches.length > 0) {
        score +=
          0.3 * (patternMatches.length / pattern.trigger.callPatterns.length);
        evidence.push(`Patterns: ${patternMatches.length} regex matches`);
        matchedContext.patterns = patternMatches;
      }
    }

    // Check contextual hints
    if (pattern.context) {
      if (pattern.context.asyncPattern && context.hasAsyncPattern) {
        score += 0.1;
        evidence.push('Async pattern detected');
      }
      if (pattern.context.errorHandling && context.hasErrorHandling) {
        score += 0.1;
        evidence.push('Error handling detected');
      }
      if (pattern.context.responseHandling && context.hasResponseHandling) {
        score += 0.1;
        evidence.push('Response handling detected');
      }
    }

    const confidence = maxScore > 0 ? Math.min(score / maxScore, 1.0) : 0;

    return {
      confidence: confidence * pattern.confidence, // Apply pattern confidence multiplier
      matchedContext,
      evidence,
    };
  }

  /**
   * Identify dominant sequence patterns from primitive matches
   */
  private identifySequence(
    matches: PrimitiveMatch[]
  ): CodalSequence | undefined {
    const primitiveNames = matches
      .filter((m) => m.confidence > 0.5)
      .map((m) => m.primitive);

    const sequences = CodalRegistry.findMatchingSequences(primitiveNames);

    // Return the most likely sequence based on match confidence
    return sequences.length > 0 ? sequences[0] : undefined;
  }

  /**
   * Generate human-readable intent description
   */
  private generateIntent(
    functionName: string,
    matches: PrimitiveMatch[],
    sequence?: CodalSequence
  ): string {
    if (sequence) {
      return `${this.humanizeName(functionName)}: ${sequence.intent}`;
    }

    const topPrimitives = matches.slice(0, 3).map((m) => m.primitive);
    const primitiveDescriptions = topPrimitives.map(
      (p) => this.primitiveRegistry[p]?.description || p
    );

    return `${this.humanizeName(functionName)}: Combines ${primitiveDescriptions.join(', ')}`;
  }

  /**
   * Suggest appropriate agent type and required capabilities
   */
  private suggestAgent(
    matches: PrimitiveMatch[],
    sequence?: CodalSequence
  ): { suggestedAgent: string; capabilities: string[] } {
    if (sequence) {
      return {
        suggestedAgent: sequence.suggestedAgent,
        capabilities: this.extractCapabilities(matches),
      };
    }

    // Fallback agent suggestion based on dominant primitives
    const topPrimitive = matches[0]?.primitive;
    const agentMap: Record<string, string> = {
      ExternalFetch: 'DataFetcherAgent',
      DataTransform: 'ProcessorAgent',
      MemoryStore: 'PersistenceAgent',
      UserInteract: 'InterfaceAgent',
      ReflexiveTrigger: 'AdaptiveAgent',
    };

    return {
      suggestedAgent: agentMap[topPrimitive] || 'GenericAgent',
      capabilities: this.extractCapabilities(matches),
    };
  }

  /**
   * Extract required capabilities from primitive matches
   */
  private extractCapabilities(matches: PrimitiveMatch[]): string[] {
    const capabilities = new Set<string>();

    for (const match of matches) {
      const primitive = this.primitiveRegistry[match.primitive];
      if (primitive) {
        primitive.capabilities.forEach((cap) => capabilities.add(cap));
      }
    }

    return Array.from(capabilities);
  }

  /**
   * Generate reflexive hooks based on patterns
   */
  private generateHooks(matches: PrimitiveMatch[]): string[] {
    const hooks: string[] = [];

    const hasReflexive = matches.some(
      (m) => m.primitive === 'ReflexiveTrigger'
    );
    const hasExternal = matches.some((m) => m.primitive === 'ExternalFetch');
    const hasError = matches.some((m) =>
      m.evidence.some((e) => e.includes('error'))
    );

    if (hasReflexive) {
      hooks.push('onAdaptiveBehavior()');
    }

    if (hasExternal) {
      hooks.push('onExternalCall()');
    }

    if (hasError) {
      hooks.push('onError(retry=3)');
    }

    return hooks;
  }

  /**
   * Calculate overall confidence score for the blueprint
   */
  private calculateConfidence(matches: PrimitiveMatch[]): number {
    if (matches.length === 0) return 0;

    const weightedSum = matches.reduce(
      (sum, match) => sum + match.confidence * match.intentWeight,
      0
    );
    const totalWeight = matches.reduce(
      (sum, match) => sum + match.intentWeight,
      0
    );

    return totalWeight > 0 ? Math.min(weightedSum / totalWeight, 1.0) : 0;
  }

  /**
   * Utility methods
   */
  private sanitizeName(name: string): string {
    return name.replace(/[^a-zA-Z0-9_]/g, '').replace(/^[0-9]/, '_$&');
  }

  private humanizeName(name: string): string {
    return name
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (str) => str.toUpperCase());
  }

  private detectLanguage(context: CodeContext): string {
    const pyImports = ['requests', 'pandas', 'numpy', 'os', 'sys'];
    const jsImports = ['axios', 'express', 'react', 'lodash'];

    const hasPython = pyImports.some((imp) => context.imports.includes(imp));
    const hasJavaScript = jsImports.some((imp) =>
      context.imports.includes(imp)
    );

    if (hasPython) return 'Python';
    if (hasJavaScript) return 'JavaScript';
    return 'Unknown';
  }
}

// Example usage and testing
export class CodeAnalyzer {
  private interpreter: CodalismInterpreter;

  constructor() {
    this.interpreter = new CodalismInterpreter();
  }

  /**
   * Analyze Python function and generate Codal Blueprint
   */
  async analyzePythonFunction(
    functionName: string,
    sourceCode: string
  ): Promise<CodalBlueprint> {
    // This would typically use a proper AST parser like Python's ast module
    // For now, we'll do simple regex-based extraction
    const context = this.extractPythonContext(sourceCode);
    return this.interpreter.interpret(functionName, context, sourceCode);
  }

  /**
   * Extract context from Python source code (simplified)
   */
  private extractPythonContext(source: string): CodeContext {
    const imports = this.extractImports(source);
    const functions = this.extractFunctionCalls(source);
    const keywords = this.extractKeywords(source);
    const callPatterns = this.extractCallPatterns(source);

    return {
      imports,
      functions,
      keywords,
      callPatterns,
      dataStructures: this.extractDataStructures(source),
      hasAsyncPattern: /async|await/.test(source),
      hasErrorHandling: /try:|except:|catch|throw/.test(source),
      hasResponseHandling: /response|result|data/.test(source),
    };
  }

  private extractImports(source: string): string[] {
    const importRegex = /import\s+(\w+)|from\s+(\w+)\s+import/g;
    const matches = [];
    let match;

    while ((match = importRegex.exec(source)) !== null) {
      matches.push(match[1] || match[2]);
    }

    return matches.filter(Boolean);
  }

  private extractFunctionCalls(source: string): string[] {
    const funcRegex = /(\w+)\s*\(/g;
    const matches = [];
    let match;

    while ((match = funcRegex.exec(source)) !== null) {
      matches.push(match[1]);
    }

    return matches;
  }

  private extractKeywords(source: string): string[] {
    const keywords = [
      'if',
      'else',
      'for',
      'while',
      'try',
      'except',
      'async',
      'await',
    ];
    return keywords.filter((keyword) => source.includes(keyword));
  }

  private extractCallPatterns(source: string): string[] {
    const patterns = [
      /\w+\.get\(/g,
      /\w+\.post\(/g,
      /\w+\.save\(/g,
      /\w+\.read\(/g,
      /\w+\.write\(/g,
    ];

    const matches = [];
    for (const pattern of patterns) {
      let match;
      while ((match = pattern.exec(source)) !== null) {
        matches.push(match[0]);
      }
    }

    return matches;
  }

  private extractDataStructures(source: string): string[] {
    const structures = [];
    if (/\[.*\]/.test(source)) structures.push('array');
    if (/\{.*\}/.test(source)) structures.push('object');
    if (/DataFrame/.test(source)) structures.push('dataframe');
    return structures;
  }
}

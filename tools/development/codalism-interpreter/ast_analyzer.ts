// Codessa AST Analyzer: The Cognitive Bridge
// Transforms raw code ASTs into Codalism semantic nodes

import * as Parser from 'tree-sitter';
import * as Python from 'tree-sitter-python';
import * as JavaScript from 'tree-sitter-javascript';
import * as TypeScript from 'tree-sitter-typescript';
import { PrimitiveMatch, CodalBlueprint } from './codalism_interpreter';

export interface Parameter {
  name: string;
  type?: string;
  defaultValue?: string;
  isOptional: boolean;
}

export interface CodalismNode {
  // Core Identity
  name: string;
  type:
    | 'Function'
    | 'Class'
    | 'Import'
    | 'Loop'
    | 'Conditional'
    | 'Assignment'
    | 'Call'
    | 'AsyncFunction';

  // Semantic Context
  codalPrimitives: PrimitiveMatch[];
  intentSignature: string;

  // Structural Information
  parameters?: Parameter[];
  returnType?: string;
  dependencies: string[];

  // Source Metadata
  sourceLanguage: string;
  startLine: number;
  endLine: number;
  raw: string;

  // Cognitive Annotations
  confidenceScore: number;
  suggestedAgent?: string;
  capabilities: string[];

  // Advanced Context
  isAsync: boolean;
  hasErrorHandling: boolean;
  hasLoops: boolean;
  callsExternal: boolean;
  modifiesState: boolean;
}

export interface ASTAnalysisResult {
  nodes: CodalismNode[];
  imports: string[];
  exports: string[];
  globalVariables: string[];
  complexity: number;
  cognitivePatterns: string[];
}

export class CodalismASTAnalyzer {
  private pythonParser: Parser;
  private jsParser: Parser;
  private tsParser: Parser;

  constructor() {
    // Initialize tree-sitter parsers
    this.pythonParser = new Parser();
    this.pythonParser.setLanguage(Python);

    this.jsParser = new Parser();
    this.jsParser.setLanguage(JavaScript);

    this.tsParser = new Parser();
    this.tsParser.setLanguage(TypeScript.typescript);
  }

  /**
   * Main entry point: analyze source code and extract Codalism nodes
   */
  async analyzeSource(
    code: string,
    language: string,
    filePath?: string
  ): Promise<ASTAnalysisResult> {
    const parser = this.getParser(language);
    if (!parser) {
      throw new Error(`Unsupported language: ${language}`);
    }

    const tree = parser.parse(code);
    const rootNode = tree.rootNode;

    const result: ASTAnalysisResult = {
      nodes: [],
      imports: [],
      exports: [],
      globalVariables: [],
      complexity: 0,
      cognitivePatterns: [],
    };

    // Extract different types of nodes based on language
    switch (language.toLowerCase()) {
      case 'python':
        await this.analyzePythonAST(rootNode, code, result);
        break;
      case 'javascript':
      case 'typescript':
        await this.analyzeJavaScriptAST(rootNode, code, result, language);
        break;
      default:
        throw new Error(`Language ${language} not yet supported`);
    }

    // Calculate overall complexity and detect cognitive patterns
    result.complexity = this.calculateComplexity(result.nodes);
    result.cognitivePatterns = this.detectCognitivePatterns(result.nodes);

    return result;
  }

  /**
   * Python AST Analysis
   */
  private async analyzePythonAST(
    rootNode: Parser.SyntaxNode,
    code: string,
    result: ASTAnalysisResult
  ): Promise<void> {
    const lines = code.split('\n');

    // Walk the AST and extract semantic nodes
    this.walkPythonNode(rootNode, lines, result);
  }

  private walkPythonNode(
    node: Parser.SyntaxNode,
    lines: string[],
    result: ASTAnalysisResult
  ): void {
    switch (node.type) {
      case 'function_definition':
        const funcNode = this.extractPythonFunction(node, lines);
        if (funcNode) {
          result.nodes.push(funcNode);
        }
        break;

      case 'class_definition':
        const classNode = this.extractPythonClass(node, lines);
        if (classNode) {
          result.nodes.push(classNode);
        }
        break;

      case 'import_statement':
      case 'import_from_statement':
        const imports = this.extractPythonImports(node);
        result.imports.push(...imports);
        break;

      case 'assignment':
        const assignment = this.extractPythonAssignment(node, lines);
        if (assignment) {
          result.nodes.push(assignment);
        }
        break;
    }

    // Recursively process child nodes
    for (let i = 0; i < node.childCount; i++) {
      this.walkPythonNode(node.child(i)!, lines, result);
    }
  }

  private extractPythonFunction(
    node: Parser.SyntaxNode,
    lines: string[]
  ): CodalismNode | null {
    const nameNode = node.childForFieldName('name');
    const parametersNode = node.childForFieldName('parameters');
    const bodyNode = node.childForFieldName('body');

    if (!nameNode || !bodyNode) return null;

    const name = nameNode.text;
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const raw = lines.slice(startLine, endLine + 1).join('\n');

    // Extract parameters
    const parameters = this.extractPythonParameters(parametersNode);

    // Analyze function body for cognitive patterns
    const bodyAnalysis = this.analyzePythonFunctionBody(bodyNode, lines);

    // Determine if function is async
    const isAsync = node.text.includes('async def');

    return {
      name,
      type: isAsync ? 'AsyncFunction' : 'Function',
      codalPrimitives: [], // Will be filled by primitive matching
      intentSignature: this.generateIntentSignature(
        name,
        parameters,
        bodyAnalysis
      ),
      parameters,
      dependencies: bodyAnalysis.dependencies,
      sourceLanguage: 'Python',
      startLine,
      endLine,
      raw,
      confidenceScore: 0, // Will be calculated later
      capabilities: bodyAnalysis.capabilities,
      isAsync,
      hasErrorHandling: bodyAnalysis.hasErrorHandling,
      hasLoops: bodyAnalysis.hasLoops,
      callsExternal: bodyAnalysis.callsExternal,
      modifiesState: bodyAnalysis.modifiesState,
    };
  }

  private extractPythonParameters(
    parametersNode: Parser.SyntaxNode | null
  ): Parameter[] {
    if (!parametersNode) return [];

    const parameters: Parameter[] = [];

    // Walk through parameter list
    for (let i = 0; i < parametersNode.childCount; i++) {
      const child = parametersNode.child(i);
      if (child?.type === 'identifier') {
        parameters.push({
          name: child.text,
          isOptional: false,
        });
      } else if (child?.type === 'default_parameter') {
        const nameNode = child.childForFieldName('name');
        const valueNode = child.childForFieldName('value');
        if (nameNode) {
          parameters.push({
            name: nameNode.text,
            defaultValue: valueNode?.text,
            isOptional: true,
          });
        }
      }
    }

    return parameters;
  }

  private analyzePythonFunctionBody(
    bodyNode: Parser.SyntaxNode,
    lines: string[]
  ): {
    dependencies: string[];
    capabilities: string[];
    hasErrorHandling: boolean;
    hasLoops: boolean;
    callsExternal: boolean;
    modifiesState: boolean;
  } {
    const analysis = {
      dependencies: [] as string[],
      capabilities: [] as string[],
      hasErrorHandling: false,
      hasLoops: false,
      callsExternal: false,
      modifiesState: false,
    };

    // Recursively analyze body
    this.walkPythonBodyNode(bodyNode, analysis);

    return analysis;
  }

  private walkPythonBodyNode(node: Parser.SyntaxNode, analysis: any): void {
    switch (node.type) {
      case 'try_statement':
        analysis.hasErrorHandling = true;
        break;

      case 'for_statement':
      case 'while_statement':
        analysis.hasLoops = true;
        break;

      case 'call':
        const callText = node.text;
        // Detect external calls
        if (this.isExternalCall(callText)) {
          analysis.callsExternal = true;
          analysis.dependencies.push(this.extractCallTarget(callText));
        }
        break;

      case 'assignment':
        analysis.modifiesState = true;
        break;
    }

    // Recursively process children
    for (let i = 0; i < node.childCount; i++) {
      this.walkPythonBodyNode(node.child(i)!, analysis);
    }
  }

  private extractPythonClass(
    node: Parser.SyntaxNode,
    lines: string[]
  ): CodalismNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;

    const name = nameNode.text;
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const raw = lines.slice(startLine, endLine + 1).join('\n');

    return {
      name,
      type: 'Class',
      codalPrimitives: [],
      intentSignature: `Class ${name}`,
      dependencies: [],
      sourceLanguage: 'Python',
      startLine,
      endLine,
      raw,
      confidenceScore: 0,
      capabilities: ['class-definition'],
      isAsync: false,
      hasErrorHandling: false,
      hasLoops: false,
      callsExternal: false,
      modifiesState: true,
    };
  }

  private extractPythonImports(node: Parser.SyntaxNode): string[] {
    const imports: string[] = [];

    if (node.type === 'import_statement') {
      // import module
      for (let i = 0; i < node.childCount; i++) {
        const child = node.child(i);
        if (child?.type === 'dotted_name' || child?.type === 'identifier') {
          imports.push(child.text);
        }
      }
    } else if (node.type === 'import_from_statement') {
      // from module import name
      const moduleNode = node.childForFieldName('module_name');
      if (moduleNode) {
        imports.push(moduleNode.text);
      }
    }

    return imports;
  }

  private extractPythonAssignment(
    node: Parser.SyntaxNode,
    lines: string[]
  ): CodalismNode | null {
    const leftNode = node.childForFieldName('left');
    const rightNode = node.childForFieldName('right');

    if (!leftNode || !rightNode) return null;

    const name = leftNode.text;
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const raw = lines.slice(startLine, endLine + 1).join('\n');

    return {
      name,
      type: 'Assignment',
      codalPrimitives: [],
      intentSignature: `Assignment: ${name}`,
      dependencies: [],
      sourceLanguage: 'Python',
      startLine,
      endLine,
      raw,
      confidenceScore: 0,
      capabilities: ['variable-assignment'],
      isAsync: false,
      hasErrorHandling: false,
      hasLoops: false,
      callsExternal: false,
      modifiesState: true,
    };
  }

  /**
   * JavaScript/TypeScript AST Analysis
   */
  private async analyzeJavaScriptAST(
    rootNode: Parser.SyntaxNode,
    code: string,
    result: ASTAnalysisResult,
    language: string
  ): Promise<void> {
    const lines = code.split('\n');
    this.walkJavaScriptNode(rootNode, lines, result, language);
  }

  private walkJavaScriptNode(
    node: Parser.SyntaxNode,
    lines: string[],
    result: ASTAnalysisResult,
    language: string
  ): void {
    switch (node.type) {
      case 'function_declaration':
      case 'function_expression':
      case 'arrow_function':
        const funcNode = this.extractJavaScriptFunction(node, lines, language);
        if (funcNode) {
          result.nodes.push(funcNode);
        }
        break;

      case 'class_declaration':
        const classNode = this.extractJavaScriptClass(node, lines, language);
        if (classNode) {
          result.nodes.push(classNode);
        }
        break;

      case 'import_statement':
        const imports = this.extractJavaScriptImports(node);
        result.imports.push(...imports);
        break;

      case 'variable_declaration':
        const assignment = this.extractJavaScriptAssignment(
          node,
          lines,
          language
        );
        if (assignment) {
          result.nodes.push(assignment);
        }
        break;
    }

    // Recursively process child nodes
    for (let i = 0; i < node.childCount; i++) {
      this.walkJavaScriptNode(node.child(i)!, lines, result, language);
    }
  }

  private extractJavaScriptFunction(
    node: Parser.SyntaxNode,
    lines: string[],
    language: string
  ): CodalismNode | null {
    const nameNode = node.childForFieldName('name');
    const parametersNode = node.childForFieldName('parameters');
    const bodyNode = node.childForFieldName('body');

    // Handle arrow functions and anonymous functions
    const name = nameNode?.text || 'anonymous';
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const raw = lines.slice(startLine, endLine + 1).join('\n');

    // Extract parameters
    const parameters = this.extractJavaScriptParameters(parametersNode);

    // Analyze function body
    const bodyAnalysis = this.analyzeJavaScriptFunctionBody(bodyNode, lines);

    // Determine if function is async
    const isAsync =
      node.text.includes('async ') || node.text.includes('await ');

    return {
      name,
      type: isAsync ? 'AsyncFunction' : 'Function',
      codalPrimitives: [],
      intentSignature: this.generateIntentSignature(
        name,
        parameters,
        bodyAnalysis
      ),
      parameters,
      dependencies: bodyAnalysis.dependencies,
      sourceLanguage: language,
      startLine,
      endLine,
      raw,
      confidenceScore: 0,
      capabilities: bodyAnalysis.capabilities,
      isAsync,
      hasErrorHandling: bodyAnalysis.hasErrorHandling,
      hasLoops: bodyAnalysis.hasLoops,
      callsExternal: bodyAnalysis.callsExternal,
      modifiesState: bodyAnalysis.modifiesState,
    };
  }

  private extractJavaScriptParameters(
    parametersNode: Parser.SyntaxNode | null
  ): Parameter[] {
    if (!parametersNode) return [];

    const parameters: Parameter[] = [];

    for (let i = 0; i < parametersNode.childCount; i++) {
      const child = parametersNode.child(i);
      if (child?.type === 'identifier') {
        parameters.push({
          name: child.text,
          isOptional: false,
        });
      } else if (child?.type === 'assignment_pattern') {
        const nameNode = child.childForFieldName('left');
        const valueNode = child.childForFieldName('right');
        if (nameNode) {
          parameters.push({
            name: nameNode.text,
            defaultValue: valueNode?.text,
            isOptional: true,
          });
        }
      }
    }

    return parameters;
  }

  private analyzeJavaScriptFunctionBody(
    bodyNode: Parser.SyntaxNode | null,
    lines: string[]
  ): any {
    const analysis = {
      dependencies: [] as string[],
      capabilities: [] as string[],
      hasErrorHandling: false,
      hasLoops: false,
      callsExternal: false,
      modifiesState: false,
    };

    if (bodyNode) {
      this.walkJavaScriptBodyNode(bodyNode, analysis);
    }

    return analysis;
  }

  private walkJavaScriptBodyNode(node: Parser.SyntaxNode, analysis: any): void {
    switch (node.type) {
      case 'try_statement':
        analysis.hasErrorHandling = true;
        break;

      case 'for_statement':
      case 'while_statement':
      case 'for_in_statement':
      case 'for_of_statement':
        analysis.hasLoops = true;
        break;

      case 'call_expression':
        const callText = node.text;
        if (this.isExternalCall(callText)) {
          analysis.callsExternal = true;
          analysis.dependencies.push(this.extractCallTarget(callText));
        }
        break;

      case 'assignment_expression':
        analysis.modifiesState = true;
        break;
    }

    for (let i = 0; i < node.childCount; i++) {
      this.walkJavaScriptBodyNode(node.child(i)!, analysis);
    }
  }

  private extractJavaScriptClass(
    node: Parser.SyntaxNode,
    lines: string[],
    language: string
  ): CodalismNode | null {
    const nameNode = node.childForFieldName('name');
    if (!nameNode) return null;

    const name = nameNode.text;
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const raw = lines.slice(startLine, endLine + 1).join('\n');

    return {
      name,
      type: 'Class',
      codalPrimitives: [],
      intentSignature: `Class ${name}`,
      dependencies: [],
      sourceLanguage: language,
      startLine,
      endLine,
      raw,
      confidenceScore: 0,
      capabilities: ['class-definition'],
      isAsync: false,
      hasErrorHandling: false,
      hasLoops: false,
      callsExternal: false,
      modifiesState: true,
    };
  }

  private extractJavaScriptImports(node: Parser.SyntaxNode): string[] {
    const imports: string[] = [];

    const sourceNode = node.childForFieldName('source');
    if (sourceNode) {
      // Remove quotes from import path
      const importPath = sourceNode.text.replace(/['"]/g, '');
      imports.push(importPath);
    }

    return imports;
  }

  private extractJavaScriptAssignment(
    node: Parser.SyntaxNode,
    lines: string[],
    language: string
  ): CodalismNode | null {
    // Extract variable declarations
    const declaratorNode = node.child(1); // Skip 'const'/'let'/'var'
    if (!declaratorNode) return null;

    const nameNode = declaratorNode.childForFieldName('name');
    if (!nameNode) return null;

    const name = nameNode.text;
    const startLine = node.startPosition.row;
    const endLine = node.endPosition.row;
    const raw = lines.slice(startLine, endLine + 1).join('\n');

    return {
      name,
      type: 'Assignment',
      codalPrimitives: [],
      intentSignature: `Assignment: ${name}`,
      dependencies: [],
      sourceLanguage: language,
      startLine,
      endLine,
      raw,
      confidenceScore: 0,
      capabilities: ['variable-assignment'],
      isAsync: false,
      hasErrorHandling: false,
      hasLoops: false,
      callsExternal: false,
      modifiesState: true,
    };
  }

  /**
   * Utility methods
   */
  private getParser(language: string): Parser | null {
    switch (language.toLowerCase()) {
      case 'python':
        return this.pythonParser;
      case 'javascript':
        return this.jsParser;
      case 'typescript':
        return this.tsParser;
      default:
        return null;
    }
  }

  private generateIntentSignature(
    name: string,
    parameters: Parameter[],
    bodyAnalysis: any
  ): string {
    const paramStr = parameters.map((p) => p.name).join(', ');
    const capabilities = bodyAnalysis.capabilities || [];

    if (bodyAnalysis.callsExternal) {
      return `${name}(${paramStr}): External interaction function`;
    } else if (bodyAnalysis.hasLoops) {
      return `${name}(${paramStr}): Iterative processing function`;
    } else if (bodyAnalysis.modifiesState) {
      return `${name}(${paramStr}): State modification function`;
    } else {
      return `${name}(${paramStr}): Pure computation function`;
    }
  }

  private isExternalCall(callText: string): boolean {
    const externalPatterns = [
      /requests\./,
      /axios\./,
      /fetch\(/,
      /http\./,
      /urllib\./,
      /\.get\(/,
      /\.post\(/,
      /\.put\(/,
      /\.delete\(/,
    ];

    return externalPatterns.some((pattern) => pattern.test(callText));
  }

  private extractCallTarget(callText: string): string {
    const match = callText.match(/(\w+)\./);
    return match ? match[1] : 'unknown';
  }

  private calculateComplexity(nodes: CodalismNode[]): number {
    let complexity = 0;

    for (const node of nodes) {
      complexity += 1; // Base complexity
      if (node.hasLoops) complexity += 2;
      if (node.hasErrorHandling) complexity += 1;
      if (node.callsExternal) complexity += 2;
      if (node.isAsync) complexity += 1;
      complexity += (node.parameters?.length || 0) * 0.5;
    }

    return Math.round(complexity);
  }

  private detectCognitivePatterns(nodes: CodalismNode[]): string[] {
    const patterns: string[] = [];

    const hasExternal = nodes.some((n) => n.callsExternal);
    const hasProcessing = nodes.some((n) => n.hasLoops);
    const hasStorage = nodes.some((n) => n.modifiesState);

    if (hasExternal && hasProcessing && hasStorage) {
      patterns.push('DataHarvestRoutine');
    }

    if (nodes.some((n) => n.isAsync)) {
      patterns.push('AsyncPattern');
    }

    if (nodes.some((n) => n.hasErrorHandling)) {
      patterns.push('RobustPattern');
    }

    return patterns;
  }
}

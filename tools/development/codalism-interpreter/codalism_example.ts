// Testing the Codalism Interpreter with real examples
import {
  CodalismInterpreter,
  CodeAnalyzer,
  CodalBlueprint,
} from './codalism_interpreter';

// Example Python code to analyze
const pythonExamples = {
  scrapeData: `
def scrape_data(url, headers=None):
    import requests
    from bs4 import BeautifulSoup
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.text, 'html.parser')
        data = parse_html(soup)
        save_to_database(data)
        return data
    except requests.RequestException as e:
        print(f"Error scraping {url}: {e}")
        return None
  `,

  emailSync: `
def sync_emails():
    import imaplib
    import email
    
    inbox = imaplib.IMAP4_SSL('imap.gmail.com')
    inbox.login(user, password)
    inbox.select("inbox")
    
    _, messages = inbox.search(None, "ALL")
    for num in messages[0].split():
        _, data = inbox.fetch(num, '(RFC822)')
        msg = email.message_from_bytes(data[0][1])
        store_email(msg)
        
    inbox.close()
    inbox.logout()
  `,

  adaptiveMonitor: `
def monitor_system():
    import time
    import psutil
    
    while True:
        cpu_usage = psutil.cpu_percent()
        memory_usage = psutil.virtual_memory().percent
        
        if cpu_usage > 80 or memory_usage > 90:
            trigger_alert("High resource usage detected")
            adapt_behavior(cpu_usage, memory_usage)
            
        time.sleep(30)
  `,

  chatProcessor: `
def process_user_message(message):
    import openai
    from intent_classifier import classify_intent
    
    user_intent = classify_intent(message)
    
    if user_intent == "question":
        response = openai.Completion.create(
            model="gpt-3.5-turbo",
            prompt=message
        )
        return response.choices[0].text
    elif user_intent == "command":
        execute_command(message)
        return "Command executed successfully"
    else:
        return "I don't understand. Can you rephrase?"
  `,
};

// Test runner for analyzing examples
async function runCodalismTests() {
  const analyzer = new CodeAnalyzer();
  const results: Record<string, CodalBlueprint> = {};

  console.log('🧠 Codalism Interpreter Test Results\n');
  console.log('='.repeat(60));

  for (const [name, code] of Object.entries(pythonExamples)) {
    console.log(`\n🔍 Analyzing: ${name}`);
    console.log('-'.repeat(40));

    try {
      const blueprint = await analyzer.analyzePythonFunction(name, code);
      results[name] = blueprint;

      console.log(`📋 Name: ${blueprint.name}`);
      console.log(`🎯 Intent: ${blueprint.intent}`);
      console.log(`🤖 Suggested Agent: ${blueprint.suggestedAgent}`);
      console.log(
        `📊 Confidence: ${(blueprint.metadata.confidenceScore * 100).toFixed(1)}%`
      );

      console.log(`\n🧬 Detected Primitives:`);
      blueprint.primitives.slice(0, 5).forEach((p, i) => {
        console.log(
          `  ${i + 1}. ${p.primitive} (${(p.confidence * 100).toFixed(1)}% confidence)`
        );
        console.log(`     Evidence: ${p.evidence.join(', ')}`);
      });

      if (blueprint.dominantSequence) {
        console.log(
          `\n🔗 Dominant Sequence: ${blueprint.dominantSequence.name}`
        );
        console.log(
          `   Pattern: ${blueprint.dominantSequence.sequence.join(' → ')}`
        );
      }

      console.log(`\n⚡ Capabilities: ${blueprint.capabilities.join(', ')}`);
      console.log(`🪝 Hooks: ${blueprint.hooks.join(', ')}`);
    } catch (error) {
      console.log(`❌ Error analyzing ${name}: ${error}`);
    }
  }

  return results;
}

// Generate Codessa Agent scaffolds from blueprints
function generateAgentScaffold(blueprint: CodalBlueprint): string {
  const agentName = blueprint.suggestedAgent;
  const capabilities = blueprint.capabilities
    .map((cap) => `"${cap}"`)
    .join(', ');
  const hooks = blueprint.hooks.map((hook) => `    ${hook};`).join('\n');

  return `
// Generated Codessa Agent: ${agentName}
// Intent: ${blueprint.intent}
// Confidence: ${(blueprint.metadata.confidenceScore * 100).toFixed(1)}%

@agent("${agentName}")
export class ${agentName} extends BaseAgent {
  capabilities = [${capabilities}];
  
  async onMessage(msg: AgentMessage) {
    // Core logic based on detected primitives:
${blueprint.primitives
  .slice(0, 3)
  .map((p) => `    // ${p.primitive}: ${p.evidence.join(', ')}`)
  .join('\n')}
    
    const result = await this.execute(msg.payload);
    this.send({ to: "MemoryManager", payload: result });
  }
  
  async execute(payload: any): Promise<any> {
    // TODO: Implement core functionality
    // Primitive sequence: ${blueprint.primitives.map((p) => p.primitive).join(' → ')}
    throw new Error("Implementation needed");
  }
  
  // Reflexive hooks
${hooks}
}`;
}

// Example blueprint-to-YAML conversion
function blueprintToYAML(blueprint: CodalBlueprint): string {
  return `
# Codal Blueprint: ${blueprint.name}
name: ${blueprint.name}
intent: "${blueprint.intent}"
confidence: ${blueprint.metadata.confidenceScore}
language: ${blueprint.metadata.sourceLanguage}

primitives:
${blueprint.primitives
  .map(
    (p) => `  - name: ${p.primitive}
    confidence: ${p.confidence}
    weight: ${p.intentWeight}
    evidence: [${p.evidence.map((e) => `"${e}"`).join(', ')}]`
  )
  .join('\n')}

${
  blueprint.dominantSequence
    ? `sequence:
  name: ${blueprint.dominantSequence.name}
  pattern: [${blueprint.dominantSequence.sequence.map((s) => `"${s}"`).join(', ')}]
  intent: "${blueprint.dominantSequence.intent}"
`
    : ''
}
agent:
  type: ${blueprint.suggestedAgent}
  capabilities: [${blueprint.capabilities.map((c) => `"${c}"`).join(', ')}]
  hooks: [${blueprint.hooks.map((h) => `"${h}"`).join(', ')}]

metadata:
  timestamp: ${blueprint.metadata.analysisTimestamp}
  source_language: ${blueprint.metadata.sourceLanguage}
`;
}

// Interactive testing interface
export class CodalismTester {
  private analyzer: CodeAnalyzer;

  constructor() {
    this.analyzer = new CodeAnalyzer();
  }

  async analyzeCode(
    functionName: string,
    sourceCode: string
  ): Promise<{
    blueprint: CodalBlueprint;
    agentScaffold: string;
    yamlBlueprint: string;
  }> {
    const blueprint = await this.analyzer.analyzePythonFunction(
      functionName,
      sourceCode
    );

    return {
      blueprint,
      agentScaffold: generateAgentScaffold(blueprint),
      yamlBlueprint: blueprintToYAML(blueprint),
    };
  }

  async runExampleTests(): Promise<void> {
    await runCodalismTests();
  }

  // Helper to simulate real-time analysis
  async analyzeAndGenerate(code: string): Promise<void> {
    console.log('🔍 Analyzing code...\n');
    console.log(code);
    console.log('\n' + '='.repeat(60));

    const functionName = this.extractFunctionName(code);
    const result = await this.analyzeCode(functionName, code);

    console.log('\n📋 CODAL BLUEPRINT:');
    console.log(result.yamlBlueprint);

    console.log('\n🤖 GENERATED AGENT SCAFFOLD:');
    console.log(result.agentScaffold);
  }

  private extractFunctionName(code: string): string {
    const match = code.match(/def\s+(\w+)/);
    return match ? match[1] : 'UnknownFunction';
  }
}

// Usage example
const tester = new CodalismTester();

// Run this to see the interpreter in action
export const demonstrateCodealism = async () => {
  console.log("🌐 CODESSA'S CODALISM INTERPRETER");
  console.log('Translating foreign code into cognitive primitives\n');

  await tester.runExampleTests();

  console.log('\n🔮 Custom Code Analysis:');
  console.log('='.repeat(60));

  // Analyze the scrape_data example step by step
  await tester.analyzeAndGenerate(pythonExamples.scrapeData);
};

// Export for external use
export {
  runCodalismTests,
  generateAgentScaffold,
  blueprintToYAML,
  CodalismTester,
};

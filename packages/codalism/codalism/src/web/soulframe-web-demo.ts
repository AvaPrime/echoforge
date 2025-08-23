/**
 * Soulframe Web Demo
 *
 * A simple web application that demonstrates the Soulframe and Codalogue components.
 */

import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { Soulframe, SoulframeOptions } from '../models/Soulframe';
import { EmotionalResonance, GrowthPattern } from '../models/SoulframeTypes';
import { Codalogue } from '../codalogue/Codalogue';
import {
  CodalogueEntryType,
  CodalogueSource,
} from '../codalogue/CodalogueTypes';

/**
 * Start a web server to demonstrate the Soulframe and Codalogue components
 */
export async function startSoulframeWebDemo(
  port: number = 3002
): Promise<void> {
  // Create a Soulframe instance
  const soulframeOptions: SoulframeOptions = {
    name: 'Harmony',
    purpose:
      'To create balance between human intention and system implementation',
    emotionalResonance: EmotionalResonance.HARMONIZING,
    growthPattern: GrowthPattern.SYMBIOTIC,
    values: ['balance', 'clarity', 'evolution', 'resonance'],
    principles: [
      'Always maintain alignment with creator intention',
      'Evolve through dialogue and reflection',
      'Preserve memory of design decisions',
      'Adapt to changing contexts while maintaining core purpose',
    ],
  };

  const harmony = new Soulframe(soulframeOptions);

  // Create a Codalogue for the Soulframe
  const codalogue = new Codalogue({
    systemId: harmony.identity.id,
    systemName: harmony.identity.name,
    initialIntention:
      'Create a system that harmonizes human intention with implementation details',
  });

  // Add some initial entries to the Codalogue
  const questionEntry = codalogue.addEntry(
    CodalogueEntryType.QUESTION,
    CodalogueSource.HUMAN,
    'How will the system maintain alignment with creator intention over time?',
    { tags: ['alignment', 'evolution'] }
  );

  const alignmentThread = codalogue.createThread(
    'Maintaining alignment with creator intention',
    questionEntry.id,
    "Discussion about how the system will stay aligned with its creator's intentions",
    ['alignment', 'core-design']
  );

  codalogue.addEntry(
    CodalogueEntryType.ANSWER,
    CodalogueSource.SYSTEM,
    'I will maintain alignment through regular reflection cycles, storing key intentions in my memory, and establishing growth hooks that trigger when potential misalignment is detected.',
    {
      relatedEntryIds: [questionEntry.id],
      tags: ['alignment', 'reflection'],
      threadId: alignmentThread.id,
    }
  );

  // Create a simple HTTP server
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Soulframe Web Demo</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
              color: #333;
            }
            h1, h2, h3 {
              color: #1890ff;
            }
            .container {
              max-width: 1200px;
              margin: 0 auto;
              padding: 20px;
            }
            .card {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              padding: 20px;
              margin-bottom: 20px;
            }
            .section {
              margin-bottom: 30px;
            }
            .property {
              margin-bottom: 10px;
            }
            .property-name {
              font-weight: bold;
              color: #722ed1;
            }
            .thread {
              border-left: 4px solid #1890ff;
              padding-left: 15px;
              margin-bottom: 20px;
            }
            .entry {
              margin-bottom: 15px;
              padding: 10px;
              border-radius: 4px;
            }
            .entry.human {
              background-color: #e6f7ff;
            }
            .entry.system {
              background-color: #f6ffed;
            }
            .entry-header {
              display: flex;
              justify-content: space-between;
              margin-bottom: 5px;
              font-size: 0.9em;
              color: #666;
            }
            .entry-content {
              font-size: 1.1em;
            }
            .tags {
              display: flex;
              flex-wrap: wrap;
              gap: 5px;
              margin-top: 5px;
            }
            .tag {
              background-color: #f0f0f0;
              padding: 2px 8px;
              border-radius: 10px;
              font-size: 0.8em;
              color: #666;
            }
            .api-section {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
            }
            pre {
              background-color: #f0f0f0;
              padding: 15px;
              border-radius: 4px;
              overflow-x: auto;
            }
            code {
              font-family: monospace;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Soulframe Web Demo</h1>
            <p>This demo shows a Soulframe instance with its Codalogue, demonstrating Stage II of the Codalism evolution.</p>
            
            <div class="section">
              <h2>Soulframe: ${harmony.identity.name}</h2>
              
              <div class="card">
                <h3>Identity</h3>
                <div class="property">
                  <span class="property-name">ID:</span> ${harmony.identity.id}
                </div>
                <div class="property">
                  <span class="property-name">Name:</span> ${harmony.identity.name}
                </div>
                <div class="property">
                  <span class="property-name">Purpose:</span> ${harmony.identity.purpose}
                </div>
                <div class="property">
                  <span class="property-name">Created:</span> ${new Date(harmony.identity.creationDate).toLocaleString()}
                </div>
              </div>
              
              <div class="card">
                <h3>Essence</h3>
                <div class="property">
                  <span class="property-name">Emotional Resonance:</span> ${harmony.essence.emotionalResonance}
                </div>
                <div class="property">
                  <span class="property-name">Values:</span> ${harmony.essence.values.join(', ')}
                </div>
                <div class="property">
                  <span class="property-name">Principles:</span>
                  <ul>
                    ${harmony.essence.principles.map((p) => `<li>${p}</li>`).join('')}
                  </ul>
                </div>
              </div>
              
              <div class="card">
                <h3>Growth</h3>
                <div class="property">
                  <span class="property-name">Pattern:</span> ${harmony.growth.pattern}
                </div>
                <div class="property">
                  <span class="property-name">Hooks:</span> ${harmony.growth.hooks.length} defined
                </div>
              </div>
            </div>
            
            <div class="section">
              <h2>Codalogue</h2>
              <div class="card">
                <h3>System Information</h3>
                <div class="property">
                  <span class="property-name">System ID:</span> ${codalogue.systemId}
                </div>
                <div class="property">
                  <span class="property-name">System Name:</span> ${codalogue.systemName}
                </div>
                <div class="property">
                  <span class="property-name">Created:</span> ${new Date().toLocaleString()}
                </div>
                <div class="property">
                  <span class="property-name">Entries:</span> ${codalogue.entries.length}
                </div>
                <div class="property">
                  <span class="property-name">Threads:</span> ${codalogue.threads.length}
                </div>
              </div>
              
              <div class="card">
                <h3>Threads</h3>
                ${codalogue.threads
                  .map(
                    (thread) => `
                  <div class="thread">
                    <h4>${thread.title}</h4>
                    <div class="property">
                      <span class="property-name">Description:</span> ${thread.description}
                    </div>
                    <div class="property">
                      <span class="property-name">Status:</span> ${thread.status}
                    </div>
                    <div class="property">
                      <span class="property-name">Tags:</span>
                      <div class="tags">
                        ${(thread.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join('')}
                      </div>
                    </div>
                    
                    <h5>Entries</h5>
                    ${thread.entryIds
                      .map(entryId => codalogue.getEntry(entryId))
                      .filter(entry => entry !== undefined)
                      .map(
                        (entry) => `
                        <div class="entry ${entry!.source.toLowerCase()}">
                          <div class="entry-header">
                            <span>${entry!.type} from ${entry!.source}</span>
                            <span>${new Date(entry!.timestamp).toLocaleString()}</span>
                          </div>
                          <div class="entry-content">${entry!.content}</div>
                          <div class="tags">
                            ${(entry!.tags || []).map((tag) => `<span class="tag">${tag}</span>`).join('')}
                          </div>
                        </div>
                      `
                      )
                      .join('')}
                  </div>
                `
                  )
                  .join('')}
              </div>
            </div>
            
            <div class="api-section">
              <h2>API Access</h2>
              <p>You can access the Soulframe and Codalogue data via the following endpoints:</p>
              
              <div class="card">
                <h3>Soulframe API</h3>
                <p>GET <a href="/api/soulframe">/api/soulframe</a> - Returns the Soulframe data as JSON</p>
                <h4>Example Response:</h4>
                <pre><code>${JSON.stringify(harmony, null, 2)}</code></pre>
              </div>
              
              <div class="card">
                <h3>Codalogue API</h3>
                <p>GET <a href="/api/codalogue">/api/codalogue</a> - Returns the Codalogue data as JSON</p>
                <h4>Example Response:</h4>
                <pre><code>${JSON.stringify(codalogue, null, 2)}</code></pre>
              </div>
            </div>
          </div>
        </body>
        </html>
      `);
    } else if (req.url === '/api/soulframe') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(harmony));
    } else if (req.url === '/api/codalogue') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(codalogue));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  // Start the server
  return new Promise<void>((resolve, reject) => {
    server.listen(port, () => {
      console.log(`Soulframe Web Demo started on http://localhost:${port}`);
      console.log('Press Ctrl+C to stop the server');
    });

    server.on('error', (error) => {
      reject(error);
    });
  });
}

// Run directly if this file is executed directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const portArg = args.find((arg) => arg.startsWith('--port='));
  const port = portArg ? parseInt(portArg.split('=')[1] || '3002', 10) : 3002;

  startSoulframeWebDemo(port).catch((error) => {
    console.error('Error:', error.message);
    process.exit(1);
  });
}

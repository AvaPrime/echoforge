/**
 * Soulframe Visualizer CLI Tool
 *
 * Displays the Soulframe architecture diagram in a web browser.
 */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as chalk from 'chalk';
import * as gradient from 'gradient-string';
import { createSpinner } from 'nanospinner';

/**
 * Start a web server to display the Soulframe architecture diagram
 */
export async function visualizeSoulframe(port: number = 3001): Promise<void> {
  const diagramPath = path.resolve(
    __dirname,
    '../../docs/soulframe-architecture.svg'
  );

  // Check if the diagram file exists
  if (!fs.existsSync(diagramPath)) {
    console.error(
      chalk.red('Error: Soulframe architecture diagram not found.')
    );
    console.error(chalk.yellow('Expected path:'), diagramPath);
    process.exit(1);
  }

  // Create a simple HTTP server
  const server = http.createServer((req, res) => {
    if (req.url === '/' || req.url === '/index.html') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Soulframe Architecture</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 20px;
              background-color: #f5f5f5;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            h1 {
              color: #333;
              margin-bottom: 20px;
            }
            .diagram-container {
              background-color: white;
              border-radius: 8px;
              box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
              padding: 20px;
              max-width: 100%;
              overflow: auto;
            }
            .info {
              margin-top: 20px;
              padding: 15px;
              background-color: #e6f7ff;
              border-left: 4px solid #1890ff;
              border-radius: 4px;
            }
          </style>
        </head>
        <body>
          <h1>Soulframe & Codalogue Architecture</h1>
          <div class="diagram-container">
            ${fs.readFileSync(diagramPath, 'utf8')}
          </div>
          <div class="info">
            <p><strong>Soulframe</strong> provides the structure for living systems with identity, memory, growth, and relationships.</p>
            <p><strong>Codalogue</strong> tracks the dialogue-driven evolution of systems through entries, threads, and statistics.</p>
            <p>Together, they form the foundation of Stage II in the Codalism evolution.</p>
          </div>
        </body>
        </html>
      `);
    } else if (req.url === '/soulframe-architecture.svg') {
      res.writeHead(200, { 'Content-Type': 'image/svg+xml' });
      res.end(fs.readFileSync(diagramPath));
    } else {
      res.writeHead(404);
      res.end('Not found');
    }
  });

  // Start the server
  const spinner = createSpinner('Starting Soulframe visualizer...').start();

  try {
    server.listen(port);
    spinner.success({
      text: chalk.green(
        `Soulframe visualizer started on http://localhost:${port}`
      ),
    });
    console.log();
    console.log(gradient.pastel('🧬 Soulframe & Codalogue Architecture'));
    console.log(
      chalk.cyan('Open your browser to view the architecture diagram')
    );
    console.log(chalk.blue(`URL: http://localhost:${port}`));
    console.log();
    console.log(chalk.yellow('Press Ctrl+C to stop the server'));

    // Keep the server running until the process is terminated
    return new Promise<void>(() => {});
  } catch (error) {
    spinner.error({
      text: chalk.red(`Failed to start Soulframe visualizer: ${error instanceof Error ? error.message : String(error)}`),
    });
    throw error;
  }
}

// Run directly if this file is executed directly
if (require.main === module) {
  // Parse command line arguments
  const args = process.argv.slice(2);
  const portArg = args.find((arg) => arg.startsWith('--port='));
  const port = portArg ? parseInt(portArg.split('=')[1] || '3001', 10) : 3001;

  visualizeSoulframe(port).catch((error) => {
    console.error(chalk.red('Error:'), error instanceof Error ? error.message : String(error));
    process.exit(1);
  });
}

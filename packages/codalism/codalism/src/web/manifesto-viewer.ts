/**
 * Codalism Manifesto Web Viewer
 *
 * A simple web viewer for the Codalism Manifesto
 */

import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { marked } from 'marked';

// Default port for the server
const PORT = 3000;

/**
 * Starts a web server to display the Codalism Manifesto
 */
export function startManifestoViewer(port: number = PORT): void {
  // Get the manifesto content
  const manifestoPath = path.join(
    __dirname,
    '..',
    '..',
    'docs',
    'manifesto.md'
  );
  const manifestoContent = fs.readFileSync(manifestoPath, 'utf-8');

  // Convert markdown to HTML
  const htmlContent = marked(manifestoContent);

  // Create the full HTML page with styling
  const fullHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>The Codalism Manifesto</title>
      <style>
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 2rem;
          background-color: #f9f9f9;
        }
        h1, h2, h3 {
          color: #6200ee;
        }
        h1 {
          font-size: 2.5rem;
          text-align: center;
          margin-bottom: 2rem;
        }
        h2 {
          font-size: 1.8rem;
          border-bottom: 2px solid #6200ee;
          padding-bottom: 0.5rem;
          margin-top: 2rem;
        }
        h3 {
          font-size: 1.4rem;
          font-style: italic;
          text-align: center;
          margin-bottom: 2rem;
        }
        p {
          margin-bottom: 1rem;
        }
        ul {
          padding-left: 2rem;
        }
        li {
          margin-bottom: 0.5rem;
        }
        blockquote {
          border-left: 4px solid #6200ee;
          padding-left: 1rem;
          font-style: italic;
          color: #555;
        }
        hr {
          border: none;
          border-top: 1px solid #ddd;
          margin: 2rem 0;
        }
        .container {
          background-color: white;
          padding: 2rem;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .footer {
          text-align: center;
          margin-top: 2rem;
          font-size: 0.9rem;
          color: #666;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${htmlContent}
      </div>
      <div class="footer">
        <p>© EchoForge - Codalism Paradigm</p>
      </div>
    </body>
    </html>
  `;

  // Create a simple HTTP server
  const server = http.createServer((req, res) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(fullHtml);
  });

  // Start the server
  server.listen(port, () => {
    console.log(`Manifesto viewer running at http://localhost:${port}`);
    console.log('Press Ctrl+C to stop the server');
  });
}

/**
 * Main function to run the manifesto viewer
 */
if (require.main === module) {
  // Get port from command line arguments if provided
  const args = process.argv.slice(2);
  const portArg = args.find((arg) => arg.startsWith('--port='));
  const port = portArg ? parseInt(portArg.split('=')[1] || PORT.toString(), 10) : PORT;

  startManifestoViewer(port);
}

# Codalism Web Tools

This directory contains web-based tools for interacting with the Codalism paradigm.

## Manifesto Viewer

The Manifesto Viewer is a simple web server that displays the Codalism Manifesto in a browser with beautiful styling.

### Usage

To run the Manifesto Viewer:

```bash
pnpm --filter @echoforge/codalism run manifesto:web
```

This will start a web server at http://localhost:3000 displaying the Codalism Manifesto.

You can specify a custom port:

```bash
pnpm --filter @echoforge/codalism run manifesto:web -- --port=8080
```

### Features

- Responsive design
- Beautiful typography and styling
- Markdown rendering

## Future Web Tools

The following web tools are planned for future development:

### Blueprint Visualizer

A web-based tool for visualizing Semantic Blueprints, showing the relationships between intents, modules, and constraints with interactive diagrams.

### Codalogue Explorer

A web interface for exploring the Codalogue, the living memory of intention that records design conversations and decisions.

### Codalism Interpreter Web UI

A web interface for the Codalism Interpreter, allowing you to transform natural language input into semantic blueprints through a user-friendly interface.

## Development

To add a new web tool:

1. Create a new TypeScript file in this directory
2. Add any necessary dependencies to the package.json
3. Add a script to run the tool in the package.json
4. Update this README with information about the new tool

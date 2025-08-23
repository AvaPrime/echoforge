# Codalism CLI Tools

This directory contains command-line interface (CLI) tools for interacting with the Codalism paradigm.

## Manifesto Renderer

The Manifesto Renderer is a beautiful terminal-based display of the Codalism Manifesto, bringing the philosophy to life through an interactive experience.

### Usage

To run the Manifesto Renderer:

```bash
pnpm --filter @echoforge/codalism run manifesto
```

This will display the Codalism Manifesto in your terminal with beautiful formatting, colors, and animations.

### Features

- Gradient text rendering
- Animated transitions between sections
- Styled formatting for different text elements (headers, lists, quotes)
- Interactive keypress navigation

## Future CLI Tools

The following CLI tools are planned for future development:

### Blueprint Visualizer

A tool for visualizing Semantic Blueprints in the terminal, showing the relationships between intents, modules, and constraints.

### Codalogue Explorer

A tool for exploring the Codalogue, the living memory of intention that records design conversations and decisions.

### Codalism Interpreter CLI

A command-line interface for the Codalism Interpreter, allowing you to transform natural language input into semantic blueprints directly from the terminal.

## Development

To add a new CLI tool:

1. Create a new TypeScript file in this directory
2. Add any necessary dependencies to the package.json
3. Add a script to run the tool in the package.json
4. Update this README with information about the new tool

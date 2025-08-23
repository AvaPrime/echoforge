# Codalism CLI Tools

## Overview

The Codalism package includes a set of CLI tools that bring the Codalism paradigm to life through interactive terminal experiences. These tools allow you to explore the Codalism philosophy, visualize semantic blueprints, and interact with the Codalism interpreter directly from your terminal.

## Installation

The CLI tools are included in the `@echoforge/codalism` package. To use them, you need to:

1. Install the package dependencies:

```bash
cd packages/codalism
pnpm install
```

2. Build the package:

```bash
pnpm run build
```

3. (Optional) Install the CLI globally:

```bash
pnpm run cli:install
```

## Available Tools

### Manifesto Renderer

The Manifesto Renderer displays the Codalism Manifesto in your terminal with beautiful formatting, colors, and animations.

#### Usage

If you've installed the CLI globally:

```bash
codalism manifesto
```

Otherwise, you can run it directly from the package:

```bash
cd packages/codalism
pnpm run manifesto
```

### Manifesto Web Viewer

The Manifesto Web Viewer starts a local web server that displays the Codalism Manifesto in your browser with beautiful styling.

#### Usage

If you've installed the CLI globally:

```bash
codalism manifesto:web
```

You can specify a custom port:

```bash
codalism manifesto:web --port=8080
```

Otherwise, you can run it directly from the package:

```bash
cd packages/codalism
pnpm run manifesto:web
```

### Soulframe Visualizer

The Soulframe Visualizer displays the Soulframe and Codalogue architecture diagram in your browser, helping you understand the structure of Codalism's Stage II components.

#### Usage

If you've installed the CLI globally:

```bash
codalism soulframe:visualize
```

You can specify a custom port:

```bash
codalism soulframe:visualize --port=8080
```

Otherwise, you can run it directly from the package:

```bash
cd packages/codalism
pnpm run soulframe:visualize
```

### CLI Help

To see all available commands:

```bash
codalism help
```

Or for a specific command:

```bash
codalism manifesto --help
```

## Development

### Adding New CLI Tools

To add a new CLI tool:

1. Create a new TypeScript file in the `src/cli` directory
2. Add your command to the `src/cli/index.ts` file
3. Update the CLI documentation

### Building the CLI

To build the CLI:

```bash
pnpm run cli:build
```

### Testing the CLI

To test the CLI without installing it globally:

```bash
pnpm run cli -- [command] [options]
```

For example:

```bash
pnpm run cli -- manifesto
```

## Future CLI Tools

The following CLI tools are planned for future development:

- **Blueprint Visualizer**: Visualize Semantic Blueprints in the terminal
- **Codalogue Explorer**: Explore the living memory of intention
- **Codalism Interpreter CLI**: Transform natural language into semantic blueprints

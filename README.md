# HMBuildToolKit

A TypeScript build toolkit designed for Claude Code generated code, providing high-performance, type-safe Mini Game Scripts for HollyMolly Sandbox.

## Overview

The primary goal of this system is to enable end-users or developers to generate and execute game logic in real-time using natural language prompts, while maintaining the rigorous safety standards of a compiled language.

## Features

- **Type Safety** - Full TypeScript type checking against custom declaration files
- **Code Quality** - ESLint-based linting with configurable rules
- **Fast Transpilation** - esbuild-powered TypeScript to JavaScript compilation
- **Error Mapping** - Source map support for debugging generated code

## Tools

| Tool | Description | Command |
|------|-------------|---------|
| TypeChecker | Type-check TypeScript files against `.d.ts` declarations | `npm run typecheck` |
| Linter | Lint TypeScript files with ESLint | `npm run lint` |
| Transpiler | Transpile TypeScript to JavaScript | `npm run transpile` |
| ErrMapper | Map JS error positions to TS source | `npm run errmap` |

## Quick Start

### Build All Tools

```bash
sed -i 's/\r$//' build_all.sh

bash ./build_all.sh
```

### Clean Build Artifacts

```bash
sed -i 's/\r$//' clear_all.sh

bash ./clear_all.sh
```

## Usage

### 1. Type Check

Validate TypeScript code against HollyMolly Sandbox type definitions:

```bash
npm run typecheck -- ./game-script.ts ./types
```

### 2. Lint

Check code quality and enforce best practices:

```bash
npm run lint -- ./game-script.ts
```

Auto-fix issues:

```bash
npm run lint -- ./game-script.ts --fix
```

### 3. Transpile

Compile TypeScript to JavaScript:

```bash
npm run transpile -- ./game-script.ts -o ./dist/game-script.js
```

With source maps for debugging:

```bash
npm run transpile -- ./game-script.ts -o ./dist/game-script.js --sourcemap
```

### 4. Map Errors

Map runtime errors back to TypeScript source:

```bash
npm run errmap -- "Error at game-script.js:25:12" ./dist/game-script.js.map
```

## Workflow

A typical workflow for processing Claude Code generated scripts:

```
Natural Language Prompt
         |
         v
   Claude Code
         |
         v
  TypeScript Code
         |
    +----+----+
    |         |
    v         v
TypeCheck   Lint
    |         |
    +----+----+
         |
         v
    Transpile
         |
         v
   JavaScript
         |
         v
  HollyMolly Sandbox
```

## Project Structure

```
HMBuildToolKit/
├── scripts/
│   ├── typechecker/    # TypeScript type checker
│   ├── linter/         # ESLint-based linter
│   ├── transpiler/     # esbuild transpiler
│   └── errmapper/      # Source map error mapper
├── output/             # Build outputs
├── docker/             # Docker configuration
├── build_all.sh        # Build all tools
├── clear_all.sh        # Clean build artifacts
└── package.json        # Root package configuration
```

## Requirements

- Node.js 18+
- npm 9+

## License

Proprietary - HollyMolly Sandbox

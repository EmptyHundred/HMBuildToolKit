# Transpiler CLI

A command-line tool to transpile TypeScript files to JavaScript using esbuild.

## Installation

```bash
cd scripts/transpiler
npm install
npm run build
```

Or from the root directory:

```bash
npm run build:transpiler
```

## Usage

### From the root directory

```bash
npm run transpile -- <ts-file> [options]
```

### From the transpiler directory

```bash
cd scripts/transpiler
npm run start -- <ts-file> [options]
```

### Direct execution

```bash
node scripts/transpiler/dist/index.js <ts-file> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `<ts-file>` | Path to the TypeScript file (`.ts` or `.tsx`) to transpile |

## Options

| Option | Description |
|--------|-------------|
| `-o`, `--outfile <path>` | Output file path (default: same name with `.js` extension) |
| `--outdir <path>` | Output directory (default: same directory as input) |
| `--minify` | Minify the output |
| `--sourcemap` | Generate source maps (placed next to output file) |
| `--sourcemap-file <path>` | Generate source map at a custom path |
| `--target <target>` | Target environment (default: `es2020`) |
| `--format <format>` | Output format: `cjs`, `esm`, `iife` (default: `cjs`) |
| `-h`, `--help` | Display usage information |

## Examples

### Basic usage

Transpile a TypeScript file to JavaScript in the same directory:

```bash
npm run transpile -- ./src/app.ts
```

### Specify output file

```bash
npm run transpile -- ./src/app.ts -o ./dist/app.js
```

### Specify output directory

```bash
npm run transpile -- ./src/app.ts --outdir ./dist
```

### Minified output with source maps

```bash
npm run transpile -- ./src/app.ts --outdir ./dist --minify --sourcemap
```

### ESM output format

```bash
npm run transpile -- ./src/app.ts --format esm -o ./dist/app.mjs
```

### Target older environments

```bash
npm run transpile -- ./src/app.ts --target es2015 -o ./dist/app.js
```

### Browser bundle (IIFE format)

```bash
npm run transpile -- ./src/app.ts --format iife -o ./dist/bundle.js
```

### Custom source map path

```bash
npm run transpile -- ./src/app.ts -o ./dist/app.js --sourcemap-file ./sourcemaps/app.js.map
```

This generates:
- `dist/app.js` - The transpiled JavaScript with a `sourceMappingURL` pointing to `../sourcemaps/app.js.map`
- `sourcemaps/app.js.map` - The source map at the custom location

## Example Files

### Input TypeScript file (`src/example.ts`)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

const getUser = (id: number): User => {
  return {
    id,
    name: "John Doe",
    email: "john@example.com"
  };
};

const user: User = getUser(1);
console.log(`User: ${user.name} (${user.email})`);
```

### Output JavaScript file (`dist/example.js`)

```javascript
const getUser = (id) => {
  return {
    id,
    name: "John Doe",
    email: "john@example.com"
  };
};
const user = getUser(1);
console.log(`User: ${user.name} (${user.email})`);
```

## Output Formats

### CommonJS (`cjs`) - Default

Suitable for Node.js applications using `require()`:

```javascript
const getUser = (id) => { ... };
module.exports = { getUser };
```

### ES Modules (`esm`)

Suitable for modern JavaScript with `import`/`export`:

```javascript
const getUser = (id) => { ... };
export { getUser };
```

### IIFE (`iife`)

Immediately Invoked Function Expression, suitable for browser scripts:

```javascript
(function() {
  const getUser = (id) => { ... };
})();
```

## Target Environments

The `--target` option controls the JavaScript version of the output. Common values:

| Target | Description |
|--------|-------------|
| `es2015` | ES6, widely supported |
| `es2017` | Adds async/await |
| `es2018` | Adds rest/spread properties |
| `es2019` | Adds optional catch binding |
| `es2020` | Adds optional chaining, nullish coalescing (default) |
| `es2021` | Adds logical assignment operators |
| `es2022` | Adds class fields, top-level await |
| `esnext` | Latest ECMAScript features |

## Output

### Success (without source map)

```
Transpiling: ./src/app.ts
Output: /path/to/dist/app.js
Transpilation successful!
```

Exit code: `0`

### Success (with source map)

```
Transpiling: ./src/app.ts
Output: /path/to/dist/app.js
Source map: /path/to/dist/app.js.map
Transpilation successful!
```

Exit code: `0`

### Failure

```
Transpiling: ./src/app.ts
Error: TypeScript file does not exist: /path/to/src/app.ts
```

Exit code: `1`

## Source Maps

Source maps allow debuggers to show the original TypeScript source when debugging the transpiled JavaScript. The transpiler provides two options for generating source maps.

### Default source map location (`--sourcemap`)

When using `--sourcemap`, a `.js.map` file is generated alongside the output:

```bash
npm run transpile -- ./src/app.ts -o ./dist/app.js --sourcemap
```

Output files:
- `dist/app.js` - Transpiled JavaScript with `//# sourceMappingURL=app.js.map`
- `dist/app.js.map` - Source map for debugging

### Custom source map location (`--sourcemap-file`)

When using `--sourcemap-file`, you can specify a custom path for the source map:

```bash
npm run transpile -- ./src/app.ts -o ./dist/app.js --sourcemap-file ./maps/app.js.map
```

Output files:
- `dist/app.js` - Transpiled JavaScript with `//# sourceMappingURL=../maps/app.js.map`
- `maps/app.js.map` - Source map at the custom location

The `sourceMappingURL` comment is automatically calculated as a relative path from the JavaScript file to the source map file.

### Source map contents

The generated source map contains:
- `version`: Source map version (always 3)
- `sources`: Relative path to the original TypeScript file
- `sourcesContent`: The original TypeScript source code
- `mappings`: Encoded mappings between JS and TS positions
- `names`: Array of identifier names (if applicable)

## esbuild Configuration

The transpiler uses esbuild with the following default settings:

- `bundle: false` - Does not bundle dependencies
- `platform: node` - Targets Node.js environment
- `target: es2020` - ECMAScript 2020 output
- `format: cjs` - CommonJS module format

## Project Structure

```
scripts/transpiler/
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── transpiler.md       # This documentation
├── src/
│   └── index.ts        # Main CLI source code
├── dist/
│   ├── index.js        # Compiled JavaScript
│   └── index.d.ts      # Type declarations
└── node_modules/       # Dependencies
```

## Dependencies

| Package | Description |
|---------|-------------|
| `esbuild` | Fast JavaScript/TypeScript bundler and transpiler |
| `typescript` | TypeScript compiler (dev dependency) |
| `@types/node` | Node.js type definitions (dev dependency) |

## Comparison with Other Tools

| Feature | Transpiler (esbuild) | tsc | Babel |
|---------|---------------------|-----|-------|
| Speed | Very fast | Slow | Medium |
| Type checking | No | Yes | No |
| Bundling | Supported | No | With plugins |
| Minification | Built-in | No | With plugins |
| Source maps | Built-in | Built-in | Built-in |

Note: This transpiler does not perform type checking. Use the `typechecker` tool for type validation before transpiling.

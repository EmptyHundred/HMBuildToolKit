# ErrMapper CLI

A command-line tool to map JavaScript error positions to their original TypeScript source positions using source maps.

## Installation

```bash
cd scripts/errmapper
npm install
npm run build
```

Or from the root directory:

```bash
npm run build:errmapper
```

## Usage

### From the root directory

```bash
npm run errmap -- <error-message> <sourcemap-file>
```

### From the errmapper directory

```bash
cd scripts/errmapper
npm run start -- <error-message> <sourcemap-file>
```

### Direct execution

```bash
node scripts/errmapper/dist/index.js <error-message> <sourcemap-file>
```

## Arguments

| Argument | Description |
|----------|-------------|
| `<error-message>` | The error message containing JavaScript file positions |
| `<sourcemap-file>` | Path to the `.map` source map file |

## Options

| Option | Description |
|--------|-------------|
| `-h`, `--help` | Display usage information |

## How It Works

1. Parses the error message to find JavaScript file positions matching the pattern `file.js:line:column` or `file.js:line`
2. Loads and parses the provided source map file
3. For each position found, looks up the original TypeScript source position
4. Replaces the JavaScript positions with the mapped TypeScript positions
5. Outputs the transformed error message

## Examples

### Basic usage

```bash
npm run errmap -- "Error at app.js:10:5" ./dist/app.js.map
```

Output:
```
Error at app.ts:15:10
```

### Stack trace mapping

```bash
npm run errmap -- "at printUserName (app.js:8:35)" ./dist/app.js.map
```

Output:
```
at printUserName (app.ts:14:34)
```

### Multiple positions in one message

```bash
npm run errmap -- "at foo (app.js:10:5) at bar (app.js:20:12)" ./dist/app.js.map
```

Output:
```
at foo (app.ts:15:10) at bar (app.ts:30:15)
```

### Full error mapping workflow

1. Transpile TypeScript with source maps:
```bash
npm run transpile -- ./src/app.ts -o ./dist/app.js --sourcemap
```

2. Run the JavaScript and capture the error:
```bash
node ./dist/app.js 2>&1
# TypeError: Cannot read property 'x' of null
#     at myFunction (/path/to/dist/app.js:25:12)
```

3. Map the error to TypeScript source:
```bash
npm run errmap -- "at myFunction (/path/to/dist/app.js:25:12)" ./dist/app.js.map
# at myFunction (app.ts:45:8)
```

## Supported Position Formats

The tool recognizes the following patterns in error messages:

| Pattern | Example |
|---------|---------|
| `filename.js:line:column` | `app.js:10:5` |
| `filename.js:line` | `app.js:10` |
| `/absolute/path/file.js:line:column` | `/dist/app.js:25:12` |
| `./relative/path/file.js:line:column` | `./dist/app.js:25:12` |

## Output

### Success

The error message with all JavaScript positions replaced by TypeScript positions:

```
Original: TypeError at /dist/app.js:25:12 - Cannot read property
Mapped:   TypeError at ../src/app.ts:45:8 - Cannot read property
```

### No positions found

If no JavaScript file positions are found in the error message, the original message is returned unchanged.

### Unmappable positions

If a position cannot be mapped (e.g., generated code with no source), the original JavaScript position is preserved.

## Source Map Requirements

The source map file must be a valid JSON file following the Source Map v3 specification:

```json
{
  "version": 3,
  "sources": ["../src/app.ts"],
  "sourcesContent": ["...original TypeScript code..."],
  "mappings": "...",
  "names": []
}
```

## Integration with Transpiler

Use the transpiler with `--sourcemap` or `--sourcemap-file` to generate source maps:

```bash
# Generate source map alongside output
npm run transpile -- ./src/app.ts -o ./dist/app.js --sourcemap

# Generate source map at custom location
npm run transpile -- ./src/app.ts -o ./dist/app.js --sourcemap-file ./maps/app.js.map
```

## Project Structure

```
scripts/errmapper/
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── errmapper.md        # This documentation
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
| `source-map` | Mozilla's source map library for parsing and querying source maps |
| `typescript` | TypeScript compiler (dev dependency) |
| `@types/node` | Node.js type definitions (dev dependency) |

## Limitations

- Only maps positions in `.js` files (not `.mjs`, `.cjs`, etc.)
- Requires the source map to be generated with `sourcesContent` for best results
- Column numbers are 1-based in input/output but 0-based internally per source map spec

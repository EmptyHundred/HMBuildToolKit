# TypeChecker CLI

A command-line tool to type-check TypeScript files, optionally against `.d.ts` declaration files.

## Installation

```bash
cd scripts/typechecker
npm install
npm run build
```

## Usage

### From the root directory

```bash
npm run typecheck -- <ts-file> [dts-folder]
```

### From the typechecker directory

```bash
cd scripts/typechecker
npm run start -- <ts-file> [dts-folder]
```

### Direct execution

```bash
node scripts/typechecker/dist/index.js <ts-file> [dts-folder]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `<ts-file>` | Path to the TypeScript file (`.ts` or `.tsx`) to check |
| `[dts-folder]` | (Optional) Path to folder containing `.d.ts` declaration files |

## Options

| Option | Description |
|--------|-------------|
| `--help`, `-h` | Display usage information |

## Examples

### Self-contained TypeScript file

Check a TypeScript file that contains all its own type definitions:

```bash
npm run typecheck -- ./src/app.ts
```

### With external declaration files

Check a TypeScript file against external `.d.ts` declaration files:

```bash
npm run typecheck -- ./src/app.ts ./types
```

### Check a file against multiple declaration files

```bash
npm run typecheck -- ./src/index.ts ./declarations
```

The tool recursively scans the declaration folder for all `.d.ts` files.

## Example Files

### Self-contained TypeScript file (`self-contained.ts`)

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function getUser(id: number): User {
  return {
    id,
    name: "John Doe",
    email: "john@example.com"
  };
}

const user: User = getUser(1);
console.log(`User: ${user.name} (${user.email})`);
```

### Declaration file (`types/api.d.ts`)

```typescript
declare interface User {
  id: number;
  name: string;
  email: string;
}

declare function getUser(id: number): User;
declare function createUser(name: string, email: string): User;
```

### Valid TypeScript file (`valid.ts`)

```typescript
const user: User = {
  id: 1,
  name: "John",
  email: "john@example.com"
};

const fetched: User = getUser(123);
const created: User = createUser("Jane", "jane@example.com");
```

### Invalid TypeScript file (`invalid.ts`)

```typescript
const user: User = {
  id: "wrong-type",  // Error: should be number
  name: "John",
  email: "john@example.com"
};

const fetched: User = getUser("not-a-number");  // Error: argument should be number
```

## Output

### Success (self-contained mode)

```
Type checking: ./src/app.ts
Mode: Self-contained (no external declarations)

✓ No type errors found!
```

Exit code: `0`

### Success (with declaration files)

```
Type checking: ./src/app.ts
Against declarations in: ./types

✓ No type errors found!
```

Exit code: `0`

### Failure

```
Type checking: ./src/app.ts
Against declarations in: ./types

✗ Found 2 type error(s):

/path/to/file.ts:3:3 - error TS2322: Type 'string' is not assignable to type 'number'.

/path/to/file.ts:8:31 - error TS2345: Argument of type 'string' is not assignable to parameter of type 'number'.
```

Exit code: `1`

## Error Format

Errors are displayed in the following format:

```
<file-path>:<line>:<column> - error TS<code>: <message>
```

## TypeScript Compiler Options

The typechecker uses the following compiler options:

- `strict: true` - Enable all strict type-checking options
- `noEmit: true` - Do not emit output files
- `target: ES2020` - ECMAScript target version
- `module: CommonJS` - Module code generation
- `moduleResolution: NodeJs` - Module resolution strategy
- `esModuleInterop: true` - Enable interoperability between CommonJS and ES modules

## Project Structure

```
scripts/typechecker/
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── typechecker.md      # This documentation
├── src/
│   └── index.ts        # Main CLI source code
├── dist/
│   ├── index.js        # Compiled JavaScript
│   └── index.d.ts      # Type declarations
└── node_modules/       # Dependencies
```

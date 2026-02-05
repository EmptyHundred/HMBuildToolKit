# Linter CLI

A command-line tool to lint TypeScript files using ESLint.

## Installation

```bash
cd scripts/linter
npm install
npm run build
```

## Usage

### From the root directory

```bash
npm run lint -- <ts-file> [options]
```

### From the linter directory

```bash
cd scripts/linter
npm run start -- <ts-file> [options]
```

### Direct execution

```bash
node scripts/linter/dist/index.js <ts-file> [options]
```

## Arguments

| Argument | Description |
|----------|-------------|
| `<ts-file>` | Path to the TypeScript file (`.ts` or `.tsx`) to lint |

## Options

| Option | Description |
|--------|-------------|
| `--fix` | Automatically fix problems that can be fixed |
| `--quiet` | Report errors only, suppress warnings |
| `--help`, `-h` | Display usage information |

## Examples

### Basic linting

```bash
npm run lint -- ./src/app.ts
```

### Auto-fix issues

```bash
npm run lint -- ./src/app.ts --fix
```

### Show errors only

```bash
npm run lint -- ./src/app.ts --quiet
```

### Combine options

```bash
npm run lint -- ./src/app.ts --fix --quiet
```

## Configured Rules

### Errors

| Rule | Description |
|------|-------------|
| `no-var` | Require `let` or `const` instead of `var` |
| `no-debugger` | Disallow `debugger` statements |
| `no-duplicate-imports` | Disallow duplicate imports |
| `eqeqeq` | Require `===` and `!==` instead of `==` and `!=` |
| `no-eval` | Disallow use of `eval()` |
| `no-implied-eval` | Disallow implied `eval()` |
| `prefer-const` | Require `const` for variables never reassigned |
| `require-await` | Disallow async functions without `await` |
| `@typescript-eslint/no-unused-vars` | Disallow unused variables (prefix with `_` to ignore) |

### Warnings

| Rule | Description |
|------|-------------|
| `no-console` | Warn on `console` usage |
| `@typescript-eslint/no-explicit-any` | Warn on `any` type usage |
| `@typescript-eslint/no-non-null-assertion` | Warn on non-null assertions (`!`) |

## Example Files

### Valid TypeScript file (`lint-valid.ts`)

```typescript
const greeting: string = "Hello, World!";

function add(a: number, b: number): number {
  return a + b;
}

const result = add(1, 2);

export { greeting, result };
```

### Invalid TypeScript file (`lint-invalid.ts`)

```typescript
var message = "Hello";  // Error: should use const/let

const unused = 42;  // Error: unused variable

function greet(name: any) {  // Warning: any type
  console.log(message + name);  // Warning: console.log
  if (name == "admin") {  // Error: should use ===
    eval("alert('admin')");  // Error: eval is not allowed
  }
}

greet("World");
```

## Output

### Success

```
Linting: ./src/app.ts

✓ No linting issues found!
```

Exit code: `0`

### Failure

```
Linting: ./src/app.ts

/path/to/file.ts:1:1 - error: Unexpected var, use let or const instead. (no-var)
/path/to/file.ts:3:7 - error: 'unused' is assigned a value but never used. (@typescript-eslint/no-unused-vars)
/path/to/file.ts:5:22 - warning: Unexpected any. Specify a different type. (@typescript-eslint/no-explicit-any)

✗ Found 2 error(s) and 1 warning(s)
```

Exit code: `1` (if errors present), `0` (if only warnings)

### With --fix

```
Linting: ./src/app.ts
Auto-fix enabled

/path/to/file.ts:3:7 - error: 'unused' is assigned a value but never used. (@typescript-eslint/no-unused-vars)

✗ Found 1 error(s)

Fixable issues have been automatically fixed.
```

## Error Format

Issues are displayed in the following format:

```
<file-path>:<line>:<column> - <severity>: <message> (<rule-id>)
```

## Customizing Rules

The ESLint configuration is located at `eslint.config.mjs`. You can modify rules by editing this file:

```javascript
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      // Add or modify rules here
      "no-console": "off",  // Disable a rule
      "eqeqeq": "warn",     // Change severity to warning
    },
  }
);
```

### Rule Severity Levels

| Level | Description |
|-------|-------------|
| `"off"` or `0` | Disable the rule |
| `"warn"` or `1` | Enable as warning (doesn't affect exit code) |
| `"error"` or `2` | Enable as error (exit code 1) |

## Project Structure

```
scripts/linter/
├── package.json        # Dependencies and scripts
├── tsconfig.json       # TypeScript configuration
├── eslint.config.mjs   # ESLint rules configuration
├── linter.md           # This documentation
├── src/
│   └── index.ts        # Main CLI source code
├── dist/
│   ├── index.js        # Compiled JavaScript
│   └── index.d.ts      # Type declarations
└── node_modules/       # Dependencies
```

## Ignoring Variables

To ignore unused variables, prefix them with an underscore:

```typescript
// This will NOT trigger an error
function example(_unusedParam: string) {
  const _unusedVar = 42;
  return "hello";
}
```

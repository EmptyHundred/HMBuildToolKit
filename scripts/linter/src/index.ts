#!/usr/bin/env node

import { ESLint } from "eslint";
import * as path from "path";
import * as fs from "fs";

interface LintResult {
  success: boolean;
  errorCount: number;
  warningCount: number;
  results: ESLint.LintResult[];
}

function printUsage(): void {
  console.log(`
Usage: linter <ts-file> [options]

Arguments:
  <ts-file>      Path to the TypeScript file to lint

Options:
  --fix          Automatically fix problems
  --quiet        Report errors only (no warnings)
  --help, -h     Display this help message

Example:
  linter ./src/app.ts
  linter ./src/app.ts --fix
  npm run start -- ./src/app.ts
`);
}

async function lintFile(
  tsFile: string,
  options: { fix?: boolean; quiet?: boolean }
): Promise<LintResult> {
  const absolutePath = path.resolve(tsFile);

  if (!fs.existsSync(absolutePath)) {
    throw new Error(`File does not exist: ${absolutePath}`);
  }

  if (!absolutePath.endsWith(".ts") && !absolutePath.endsWith(".tsx")) {
    throw new Error(`File must be a .ts or .tsx file: ${absolutePath}`);
  }

  const eslint = new ESLint({
    fix: options.fix || false,
    overrideConfigFile: path.join(__dirname, "..", "eslint.config.mjs"),
  });

  const results = await eslint.lintFiles([absolutePath]);

  if (options.fix) {
    await ESLint.outputFixes(results);
  }

  let errorCount = 0;
  let warningCount = 0;

  for (const result of results) {
    errorCount += result.errorCount;
    warningCount += result.warningCount;
  }

  if (options.quiet) {
    warningCount = 0;
    for (const result of results) {
      result.messages = result.messages.filter((msg) => msg.severity === 2);
      result.warningCount = 0;
    }
  }

  return {
    success: errorCount === 0,
    errorCount,
    warningCount,
    results,
  };
}

function formatResults(results: ESLint.LintResult[]): string {
  const lines: string[] = [];

  for (const result of results) {
    if (result.messages.length === 0) continue;

    for (const message of result.messages) {
      const severity = message.severity === 2 ? "error" : "warning";
      const line = message.line || 0;
      const column = message.column || 0;
      const ruleId = message.ruleId || "unknown";

      lines.push(
        `${result.filePath}:${line}:${column} - ${severity}: ${message.message} (${ruleId})`
      );
    }
  }

  return lines.join("\n");
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const tsFile = args.find((arg) => !arg.startsWith("--"));
  const fix = args.includes("--fix");
  const quiet = args.includes("--quiet");

  if (!tsFile) {
    console.error("Error: No TypeScript file specified.\n");
    printUsage();
    process.exit(1);
  }

  console.log(`Linting: ${tsFile}`);
  if (fix) console.log("Auto-fix enabled");
  console.log("");

  try {
    const result = await lintFile(tsFile, { fix, quiet });

    if (result.errorCount === 0 && result.warningCount === 0) {
      console.log("✓ No linting issues found!");
      process.exit(0);
    } else {
      const output = formatResults(result.results);
      console.log(output);
      console.log("");

      const summary: string[] = [];
      if (result.errorCount > 0) {
        summary.push(`${result.errorCount} error(s)`);
      }
      if (result.warningCount > 0) {
        summary.push(`${result.warningCount} warning(s)`);
      }

      console.log(`✗ Found ${summary.join(" and ")}`);

      if (fix) {
        console.log("\nFixable issues have been automatically fixed.");
      }

      process.exit(result.errorCount > 0 ? 1 : 0);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();

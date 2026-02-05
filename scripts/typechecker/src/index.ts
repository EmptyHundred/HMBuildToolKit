#!/usr/bin/env node

import * as ts from "typescript";
import * as path from "path";
import * as fs from "fs";

interface TypeCheckResult {
  success: boolean;
  errors: string[];
  fileChecked: string;
  declarationFolder?: string;
}

function printUsage(): void {
  console.log(`
Usage: typechecker <ts-file> [dts-folder]

Arguments:
  <ts-file>      Path to the TypeScript file to check
  [dts-folder]   (Optional) Path to folder containing .d.ts declaration files

Example:
  typechecker ./src/app.ts
  typechecker ./src/app.ts ./types
  npm run typecheck -- ./src/app.ts ./types
`);
}

function collectDtsFiles(folder: string): string[] {
  const dtsFiles: string[] = [];

  if (!fs.existsSync(folder)) {
    throw new Error(`Declaration folder does not exist: ${folder}`);
  }

  const entries = fs.readdirSync(folder, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(folder, entry.name);
    if (entry.isDirectory()) {
      dtsFiles.push(...collectDtsFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".d.ts")) {
      dtsFiles.push(fullPath);
    }
  }

  return dtsFiles;
}

function typeCheck(tsFile: string, dtsFolder?: string): TypeCheckResult {
  const absoluteTsFile = path.resolve(tsFile);
  const absoluteDtsFolder = dtsFolder ? path.resolve(dtsFolder) : undefined;

  if (!fs.existsSync(absoluteTsFile)) {
    return {
      success: false,
      errors: [`TypeScript file does not exist: ${absoluteTsFile}`],
      fileChecked: absoluteTsFile,
      declarationFolder: absoluteDtsFolder,
    };
  }

  if (!absoluteTsFile.endsWith(".ts") && !absoluteTsFile.endsWith(".tsx")) {
    return {
      success: false,
      errors: [`File must be a .ts or .tsx file: ${absoluteTsFile}`],
      fileChecked: absoluteTsFile,
      declarationFolder: absoluteDtsFolder,
    };
  }

  let dtsFiles: string[] = [];
  if (absoluteDtsFolder) {
    dtsFiles = collectDtsFiles(absoluteDtsFolder);
    if (dtsFiles.length === 0) {
      console.warn(`Warning: No .d.ts files found in ${absoluteDtsFolder}`);
    }
  }

  const compilerOptions: ts.CompilerOptions = {
    noEmit: true,
    strict: true,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
    esModuleInterop: true,
    skipLibCheck: false,
    baseUrl: path.dirname(absoluteTsFile),
  };

  if (absoluteDtsFolder) {
    compilerOptions.typeRoots = [absoluteDtsFolder];
    compilerOptions.types = [];
    compilerOptions.paths = {
      "*": [path.join(absoluteDtsFolder, "*")],
    };
  }

  const filesToCompile = [absoluteTsFile, ...dtsFiles];

  const host = ts.createCompilerHost(compilerOptions);
  const program = ts.createProgram(filesToCompile, compilerOptions, host);

  const diagnostics = ts.getPreEmitDiagnostics(program);

  const errors: string[] = [];

  for (const diagnostic of diagnostics) {
    let message: string;

    if (diagnostic.file && diagnostic.start !== undefined) {
      const { line, character } = diagnostic.file.getLineAndCharacterOfPosition(
        diagnostic.start
      );
      const messageText = ts.flattenDiagnosticMessageText(
        diagnostic.messageText,
        "\n"
      );
      message = `${diagnostic.file.fileName}:${line + 1}:${character + 1} - error TS${diagnostic.code}: ${messageText}`;
    } else {
      message = ts.flattenDiagnosticMessageText(diagnostic.messageText, "\n");
    }

    errors.push(message);
  }

  return {
    success: errors.length === 0,
    errors,
    fileChecked: absoluteTsFile,
    declarationFolder: absoluteDtsFolder,
  };
}

function main(): void {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  const [tsFile, dtsFolder] = args;

  console.log(`Type checking: ${tsFile}`);
  if (dtsFolder) {
    console.log(`Against declarations in: ${dtsFolder}`);
  } else {
    console.log(`Mode: Self-contained (no external declarations)`);
  }
  console.log("");

  try {
    const result = typeCheck(tsFile, dtsFolder);

    if (result.success) {
      console.log("✓ No type errors found!");
      process.exit(0);
    } else {
      console.error(`✗ Found ${result.errors.length} type error(s):\n`);
      for (const error of result.errors) {
        console.error(error);
        console.error("");
      }
      process.exit(1);
    }
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();

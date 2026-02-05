#!/usr/bin/env node

import * as esbuild from "esbuild";
import * as path from "path";
import * as fs from "fs";

interface TranspileResult {
  success: boolean;
  inputFile: string;
  outputFile: string;
  sourcemapFile?: string;
  error?: string;
}

function printUsage(): void {
  console.log(`
Usage: transpiler <ts-file> [options]

Arguments:
  <ts-file>      Path to the TypeScript file to transpile

Options:
  -o, --outfile <path>       Output file path (default: same name with .js extension)
  --outdir <path>            Output directory (default: same directory as input)
  --minify                   Minify the output
  --sourcemap                Generate source maps (inline)
  --sourcemap-file <path>    Generate external source map at specified path
  --target <target>          Target environment (default: es2020)
  --format <format>          Output format: cjs, esm, iife (default: cjs)
  -h, --help                 Show this help message

Example:
  transpiler ./src/app.ts
  transpiler ./src/app.ts -o ./dist/app.js
  transpiler ./src/app.ts --outdir ./dist --minify --sourcemap
  transpiler ./src/app.ts -o ./dist/app.js --sourcemap-file ./dist/app.js.map
  npm run transpile -- ./src/app.ts
`);
}

interface TranspileOptions {
  inputFile: string;
  outfile?: string;
  outdir?: string;
  minify: boolean;
  sourcemap: boolean;
  sourcemapFile?: string;
  target: string;
  format: "cjs" | "esm" | "iife";
}

function parseArgs(args: string[]): TranspileOptions | null {
  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    return null;
  }

  const options: TranspileOptions = {
    inputFile: "",
    minify: false,
    sourcemap: false,
    target: "es2020",
    format: "cjs",
  };

  let i = 0;
  while (i < args.length) {
    const arg = args[i];

    if (arg === "-o" || arg === "--outfile") {
      options.outfile = args[++i];
    } else if (arg === "--outdir") {
      options.outdir = args[++i];
    } else if (arg === "--minify") {
      options.minify = true;
    } else if (arg === "--sourcemap") {
      options.sourcemap = true;
    } else if (arg === "--sourcemap-file") {
      options.sourcemapFile = args[++i];
      options.sourcemap = true;
    } else if (arg === "--target") {
      options.target = args[++i];
    } else if (arg === "--format") {
      const format = args[++i];
      if (format === "cjs" || format === "esm" || format === "iife") {
        options.format = format;
      } else {
        console.error(`Error: Invalid format "${format}". Must be cjs, esm, or iife.`);
        process.exit(1);
      }
    } else if (!arg.startsWith("-")) {
      if (!options.inputFile) {
        options.inputFile = arg;
      }
    } else {
      console.error(`Error: Unknown option "${arg}"`);
      process.exit(1);
    }
    i++;
  }

  if (!options.inputFile) {
    console.error("Error: No input file specified.\n");
    return null;
  }

  return options;
}

async function transpile(options: TranspileOptions): Promise<TranspileResult> {
  const absoluteInputFile = path.resolve(options.inputFile);

  if (!fs.existsSync(absoluteInputFile)) {
    return {
      success: false,
      inputFile: absoluteInputFile,
      outputFile: "",
      error: `TypeScript file does not exist: ${absoluteInputFile}`,
    };
  }

  if (!absoluteInputFile.endsWith(".ts") && !absoluteInputFile.endsWith(".tsx")) {
    return {
      success: false,
      inputFile: absoluteInputFile,
      outputFile: "",
      error: `File must be a .ts or .tsx file: ${absoluteInputFile}`,
    };
  }

  let outputFile: string;
  if (options.outfile) {
    outputFile = path.resolve(options.outfile);
  } else {
    const inputDir = options.outdir ? path.resolve(options.outdir) : path.dirname(absoluteInputFile);
    const baseName = path.basename(absoluteInputFile).replace(/\.tsx?$/, ".js");
    outputFile = path.join(inputDir, baseName);
  }

  const outputDir = path.dirname(outputFile);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  try {
    let sourcemapOption: boolean | "linked" | "inline" | "external" | "both" = false;
    if (options.sourcemapFile) {
      sourcemapOption = "external";
    } else if (options.sourcemap) {
      sourcemapOption = "linked";
    }

    await esbuild.build({
      entryPoints: [absoluteInputFile],
      outfile: outputFile,
      bundle: false,
      minify: options.minify,
      sourcemap: sourcemapOption,
      target: options.target,
      format: options.format === "cjs" ? "cjs" : options.format === "esm" ? "esm" : "iife",
      platform: "node",
    });

    let finalSourcemapFile: string | undefined;

    if (options.sourcemapFile) {
      const defaultSourcemapPath = outputFile + ".map";
      const customSourcemapPath = path.resolve(options.sourcemapFile);

      const sourcemapDir = path.dirname(customSourcemapPath);
      if (!fs.existsSync(sourcemapDir)) {
        fs.mkdirSync(sourcemapDir, { recursive: true });
      }

      if (fs.existsSync(defaultSourcemapPath)) {
        const sourcemapContent = fs.readFileSync(defaultSourcemapPath, "utf-8");
        fs.writeFileSync(customSourcemapPath, sourcemapContent);
        fs.unlinkSync(defaultSourcemapPath);
      }

      const jsContent = fs.readFileSync(outputFile, "utf-8");
      const relativePath = path.relative(path.dirname(outputFile), customSourcemapPath);
      const sourceMappingComment = `//# sourceMappingURL=${relativePath}`;

      let updatedJsContent: string;
      if (/\/\/# sourceMappingURL=.+$/m.test(jsContent)) {
        updatedJsContent = jsContent.replace(
          /\/\/# sourceMappingURL=.+$/m,
          sourceMappingComment
        );
      } else {
        updatedJsContent = jsContent.trimEnd() + `\n${sourceMappingComment}\n`;
      }
      fs.writeFileSync(outputFile, updatedJsContent);

      finalSourcemapFile = customSourcemapPath;
    } else if (options.sourcemap) {
      finalSourcemapFile = outputFile + ".map";
    }

    return {
      success: true,
      inputFile: absoluteInputFile,
      outputFile: outputFile,
      sourcemapFile: finalSourcemapFile,
    };
  } catch (error) {
    return {
      success: false,
      inputFile: absoluteInputFile,
      outputFile: outputFile,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const options = parseArgs(args);

  if (!options) {
    printUsage();
    process.exit(args.includes("--help") || args.includes("-h") ? 0 : 1);
  }

  console.log(`Transpiling: ${options.inputFile}`);

  const result = await transpile(options);

  if (result.success) {
    console.log(`Output: ${result.outputFile}`);
    if (result.sourcemapFile) {
      console.log(`Source map: ${result.sourcemapFile}`);
    }
    console.log("Transpilation successful!");
    process.exit(0);
  } else {
    console.error(`Error: ${result.error}`);
    process.exit(1);
  }
}

main();

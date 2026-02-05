#!/usr/bin/env node

import * as fs from "fs";
import * as path from "path";
import { SourceMapConsumer, RawSourceMap } from "source-map";

interface MappedPosition {
  source: string | null;
  line: number | null;
  column: number | null;
  name: string | null;
}

interface PositionMatch {
  fullMatch: string;
  file: string;
  line: number;
  column: number;
  startIndex: number;
  endIndex: number;
}

function printUsage(): void {
  console.log(`
Usage: errmapper <error-message> <sourcemap-file>

Arguments:
  <error-message>    The error message containing JS file positions
  <sourcemap-file>   Path to the .map source map file

Options:
  -h, --help         Show this help message

Description:
  Maps JavaScript error positions (file.js:line:column) to their original
  TypeScript source positions using the provided source map.

Example:
  errmapper "Error at app.js:10:5" ./dist/app.js.map
  errmapper "TypeError: Cannot read property 'x' at /dist/app.js:25:12" ./dist/app.js.map
  npm run errmap -- "Error at app.js:10:5" ./dist/app.js.map
`);
}

function findPositions(errorMessage: string): PositionMatch[] {
  const matches: PositionMatch[] = [];

  // Pattern to match file.js:line:column or file.js:line
  // Supports absolute paths, relative paths, and just filenames
  const pattern = /([^\s:()]+\.js):(\d+)(?::(\d+))?/g;

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(errorMessage)) !== null) {
    matches.push({
      fullMatch: match[0],
      file: match[1],
      line: parseInt(match[2], 10),
      column: match[3] ? parseInt(match[3], 10) : 1,
      startIndex: match.index,
      endIndex: match.index + match[0].length,
    });
  }

  return matches;
}

async function mapPosition(
  consumer: SourceMapConsumer,
  line: number,
  column: number
): Promise<MappedPosition> {
  const position = consumer.originalPositionFor({
    line,
    column: column - 1, // source-map uses 0-based columns
  });

  return {
    source: position.source,
    line: position.line,
    column: position.column !== null ? position.column + 1 : null, // Convert back to 1-based
    name: position.name,
  };
}

function formatMappedPosition(original: PositionMatch, mapped: MappedPosition): string {
  if (mapped.source === null || mapped.line === null) {
    return original.fullMatch;
  }

  const source = mapped.source;
  const line = mapped.line;
  const column = mapped.column !== null ? `:${mapped.column}` : "";

  return `${source}:${line}${column}`;
}

async function mapErrorMessage(
  errorMessage: string,
  sourcemapPath: string
): Promise<string> {
  const absoluteSourcemapPath = path.resolve(sourcemapPath);

  if (!fs.existsSync(absoluteSourcemapPath)) {
    throw new Error(`Source map file does not exist: ${absoluteSourcemapPath}`);
  }

  const sourcemapContent = fs.readFileSync(absoluteSourcemapPath, "utf-8");
  let sourcemap: RawSourceMap;

  try {
    sourcemap = JSON.parse(sourcemapContent) as RawSourceMap;
  } catch {
    throw new Error(`Invalid source map JSON: ${absoluteSourcemapPath}`);
  }

  const positions = findPositions(errorMessage);

  if (positions.length === 0) {
    return errorMessage;
  }

  const consumer = await new SourceMapConsumer(sourcemap);

  try {
    let result = errorMessage;
    let offset = 0;

    for (const pos of positions) {
      const mapped = await mapPosition(consumer, pos.line, pos.column);
      const replacement = formatMappedPosition(pos, mapped);

      const adjustedStart = pos.startIndex + offset;
      const adjustedEnd = pos.endIndex + offset;

      result = result.slice(0, adjustedStart) + replacement + result.slice(adjustedEnd);
      offset += replacement.length - pos.fullMatch.length;
    }

    return result;
  } finally {
    consumer.destroy();
  }
}

async function main(): Promise<void> {
  const args = process.argv.slice(2);

  if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
    printUsage();
    process.exit(args.length === 0 ? 1 : 0);
  }

  if (args.length < 2) {
    console.error("Error: Both <error-message> and <sourcemap-file> arguments are required.\n");
    printUsage();
    process.exit(1);
  }

  const [errorMessage, sourcemapFile] = args;

  try {
    const mappedMessage = await mapErrorMessage(errorMessage, sourcemapFile);
    console.log(mappedMessage);
  } catch (error) {
    console.error(`Error: ${error instanceof Error ? error.message : error}`);
    process.exit(1);
  }
}

main();

import { log, createHandler, type LogMethod, STORAGE_KEY } from "./common.js";
import chalk, { type ChalkInstance } from "chalk";
import isUnicodeSupported from "is-unicode-supported";
import * as Symbols from "./symbols.js";

const logSymbols = isUnicodeSupported() ? Symbols.main : Symbols.fallback;

const color = {
  info: chalk.blue,
  success: chalk.green,
  warn: chalk.yellow,
  error: chalk.red,
  log: chalk.white,
  trace: chalk.green,
  debug: chalk.dim,
} as { readonly [key in LogMethod]: ChalkInstance };

function createLogger(
  name: string,
  options: {
    level?: LogMethod;
    tap?: (
      method: LogMethod,
      args: Parameters<(typeof console)[LogMethod]>
    ) => void;
    showLevel?: boolean;
  } = {
    level: getDefaultLevel(),
    showLevel: true,
  }
) {
  // todo: check if we can have a global here and if a bundler tree shakes it
  let bindArgs = (level: LogMethod) => [
    color[level](`${options.showLevel ? logSymbols[level] : ""} ${name}:`),
  ];

  return new Proxy(
    console,
    createHandler(options.level, bindArgs, options.tap, ls)
  );
}

const store: Record<string, string> = {};
const ls = {
  getItem: (key: string): string | null => store[key] ?? null,
  setItem: (key: string, value: string) => (store[key] = value),
};

function getDefaultLevel(): LogMethod {
  return (ls.getItem(STORAGE_KEY) ?? "trace") as LogMethod;
}

function setDefaultLevel(level: LogMethod) {
  ls.setItem(STORAGE_KEY, level);
}

export { createLogger, log, getDefaultLevel, setDefaultLevel };

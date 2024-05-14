import {
  log,
  getDefaultLevel,
  setDefaultLevel,
  createHandler,
  defaultLevel,
  type LogMethod,
} from "./common.js";
import chalk, { type ChalkInstance } from "chalk";
import isUnicodeSupported from "is-unicode-supported";

const main = {
  info: "ℹ",
  success: "✔",
  warn: "⚠",
  error: "✖",
  log: "•", 
  trace: "↪",
  debug: "𓆣",
} as { readonly [key in LogMethod]: string };

const fallback = {
  info: "i",
  success: "√",
  warn: "‼",
  error: "×",
  log: "•",
  trace: "»",
  debug: "Þ",
} as { readonly [key in LogMethod]: string };

const logSymbols = isUnicodeSupported() ? main : fallback;

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
    applyCallback?: (
      method: LogMethod,
      args: Parameters<(typeof console)[LogMethod]>
    ) => void;
    showLevel?: boolean;
  } = {
    level: defaultLevel,
    showLevel: true,
  }
) {
  // todo: check if we can have a global here and if a bundler tree shakes it
  let bindArgs = (level: LogMethod) => [
    color[level](`${options.showLevel ? logSymbols[level] : ""} ${name}:`),
  ];

  return new Proxy(
    console,
    createHandler(options.level, bindArgs, options.applyCallback)
  );
}

export { createLogger, log, getDefaultLevel, setDefaultLevel };

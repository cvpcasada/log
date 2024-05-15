import { log, createHandler, type LogMethod, STORAGE_KEY } from "./common.js";
import { main as symbols } from "./symbols.js";
const ColorMap = {
  trace: "#95bdb7",
  debug: "#ad95b8",
  info: "#b6bd73",
  log: "#88a1bb",
  warn: "#e9c880",
  error: "#bf6c69",
} as { readonly [key in LogMethod]: string };

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
    `%c${options.showLevel ? symbols[level] : ""} ${name}:%c`,
    `color: ${ColorMap[level]}; font-weight: bold;`,
    `color: inherit;`,
  ];

  return new Proxy(
    console,
    createHandler(options.level, bindArgs, options.tap, localStorage)
  );
}

function getDefaultLevel(): LogMethod {
  return (localStorage.getItem(STORAGE_KEY) ?? "trace") as LogMethod;
}

function setDefaultLevel(level: LogMethod) {
  localStorage.setItem(STORAGE_KEY, level);
}

export { createLogger, log, getDefaultLevel, setDefaultLevel };

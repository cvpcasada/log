import {
  log,
  getDefaultLevel,
  setDefaultLevel,
  createHandler,
  defaultLevel,
  type LogMethod,
} from "./common.js";

const ColorMap = {
  trace: "#95bdb7",
  debug: "#ad95b8",
  info: "#b6bd73",
  log: "#88a1bb",
  warn: "#e9c880",
  error: "#bf6c69",
} as { readonly [key in LogMethod]: string };

const symbols = {
  info: "ℹ",
  success: "✔",
  warn: "⚠",
  error: "✖",
  log: "•",
  trace: "↪",
  debug: "𓆣",
} as { readonly [key in LogMethod]: string };

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
    `%c${options.showLevel ? symbols[level] : ""} ${name}:%c`,
    `color: ${ColorMap[level]}; font-weight: bold;`,
    `color: inherit;`,
  ];

  return new Proxy(
    console,
    createHandler(options.level, bindArgs, options.applyCallback)
  );
}

export { createLogger, log, getDefaultLevel, setDefaultLevel };

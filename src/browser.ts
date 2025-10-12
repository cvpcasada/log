import {
  Logger,
  createProxy,
  type LoggerInstance, type LogMethod,
  LoggerOptions
} from "./logger";

class LSStorage {
  get(key: string) {
    return localStorage.getItem(key);
  }
  set(key: string, value: string) {
    localStorage.setItem(key, value);
  }
  del(key: string) {
    localStorage.removeItem(key);
  }
}

const colors: Record<LogMethod, string> = {
  trace: "#95bdb7",
  debug: "#ad95b8",
  info: "#b6bd73",
  warn: "#88a1bb",
  error: "#bf6c69",
};

const symbols = {
  info: "⚡️",
  success: "✔",
  warn: "▲",
  error: "✖",
  log: "●",
  trace: "◔",
  debug: "◌",
} as const;

const env = {
  bind(consoleImpl, method, name) {
    const prefix = name
      ? `${symbols[method]} ${String(name)}:`
      : `${symbols[method]}`;

    const real = consoleImpl[method] || consoleImpl.log;
    return real.bind(
      consoleImpl,
      `%c${prefix}%c`,
      `color: ${colors[method]}; font-weight: bold;`,
      "color: inherit"
    );
  },
} as const satisfies LoggerOptions;

export const log: LoggerInstance = createProxy(
  new Logger(new LSStorage(), env)
);

export type { LogLevel } from "./logger";

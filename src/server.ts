import {
  Logger,
  createProxy,
  type LoggerInstance,
  type LogMethod,
  LoggerOptions,
} from "./logger";

class MemStorage {
  private data: Record<string, string> = {};
  get(key: string) {
    return this.data[key] ?? null;
  }
  set(key: string, value: string) {
    this.data[key] = value;
  }
  del(key: string) {
    delete this.data[key];
  }
}

function isUnicodeSupported() {
  const { env } = process;
  const { TERM, TERM_PROGRAM } = env;

  if (process.platform !== "win32") {
    return TERM !== "linux";
  }

  return (
    Boolean(env.WT_SESSION) ||
    Boolean(env.TERMINUS_SUBLIME) ||
    env.ConEmuTask === "{cmd::Cmder}" ||
    TERM_PROGRAM === "Terminus-Sublime" ||
    TERM_PROGRAM === "vscode" ||
    TERM === "xterm-256color" ||
    TERM === "alacritty" ||
    TERM === "rxvt-unicode" ||
    TERM === "rxvt-unicode-256color" ||
    env.TERMINAL_EMULATOR === "JetBrains-JediTerm"
  );
}

const colors: Record<LogMethod, string> = {
  trace: "\x1b[90m",
  debug: "\x1b[34m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

const fallbackSymbols = {
  info: "i",
  success: "√",
  warn: "‼",
  error: "×",
  log: "•",
  trace: "»",
  debug: "*",
} as const satisfies Record<LogMethod | "log" | "success", string>;

const unicodeSymbols = {
  info: "⚡️",
  success: "✔",
  warn: "▲",
  error: "✖",
  log: "●",
  trace: "◔",
  debug: "◌",
} as const satisfies Record<LogMethod | "log" | "success", string>;

let symbols = isUnicodeSupported() ? unicodeSymbols : fallbackSymbols;

const env = {
  bind(consoleImpl, method, name) {
    const prefix = name
      ? `${symbols[method]} ${String(name)}:`
      : `${symbols[method]}`;

    const real = consoleImpl[method] || consoleImpl.log;
    const styled = `${colors[method]}${prefix}\x1b[0m`;
    return real.bind(consoleImpl, styled);
  },
} as const satisfies LoggerOptions;

export const log: LoggerInstance = createProxy(
  new Logger(new MemStorage(), env)
);

export type { LogLevel } from "./logger";

import {
  Logger,
  createProxy,
  MemStorage,
  createEnv,
  UNICODE_SYMBOLS,
  FALLBACK_SYMBOLS,
  type LoggerInstance,
  COLORS,
} from "./logger";

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

const symbols = isUnicodeSupported() ? UNICODE_SYMBOLS : FALLBACK_SYMBOLS;

export const log: LoggerInstance = createProxy(
  new Logger(new MemStorage(), createEnv(symbols, COLORS)),
);

export type { LogLevel } from "./logger";

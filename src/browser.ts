import {
  Logger,
  createProxy,
  MemStorage,
  createEnv,
  type LoggerInstance,
  type IStorage,
  LogMethod,
  UNICODE_SYMBOLS,
} from "./logger";

const COLORS: Record<LogMethod, string> = {
  trace: "\x1b[38;2;149;189;183m", // #95bdb7
  debug: "\x1b[38;2;173;149;184m", // #ad95b8
  info: "\x1b[38;2;182;189;115m", // #b6bd73
  log: "\x1b[38;2;128;128;128m", // #808080 (grey)
  warn: "\x1b[38;2;136;161;187m", // #88a1bb
  error: "\x1b[38;2;191;108;105m", // #bf6c69
};

class LSStorage implements IStorage {
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

const storage: IStorage =
  typeof localStorage !== "undefined" ? new LSStorage() : new MemStorage();

export const log: LoggerInstance = createProxy(
  new Logger(storage, createEnv(UNICODE_SYMBOLS, COLORS)),
);

export type { LogLevel } from "./logger";

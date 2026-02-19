export type LogLevel = "trace" | "debug" | "info" | "warn" | "error" | "silent";
export type LogMethod = "trace" | "debug" | "info" | "warn" | "error";

export const COLORS: Record<LogMethod, string> = {
  trace: "\x1b[90m",
  debug: "\x1b[34m",
  info: "\x1b[32m",
  warn: "\x1b[33m",
  error: "\x1b[31m",
};

export const UNICODE_SYMBOLS = {
  info: "⚡️",
  success: "✔",
  warn: "▲",
  error: "✖",
  log: "●",
  trace: "◔",
  debug: "◌",
} as const satisfies Record<LogMethod | "log" | "success", string>;

export const FALLBACK_SYMBOLS = {
  info: "i",
  success: "√",
  warn: "‼",
  error: "×",
  log: "•",
  trace: "»",
  debug: "*",
} as const satisfies Record<LogMethod | "log" | "success", string>;

export type SymbolSet = Record<LogMethod | "log" | "success", string>;

export interface IStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
  del(key: string): void;
}

export interface LoggerOptions {
  bind: (
    consoleImpl: Console,
    method: LogMethod,
    name: string | symbol | undefined,
  ) => (...args: any[]) => void;
}

export function createEnv(
  symbols: SymbolSet,
  colors: Record<LogMethod, string>,
): LoggerOptions {
  return {
    bind(consoleImpl, method, name) {
      const prefix = name
        ? `${symbols[method]} ${String(name)}:`
        : `${symbols[method]}`;

      const real = consoleImpl[method] || consoleImpl.log;
      const styled = `${colors[method]}${prefix}\x1b[0m`;
      return real.bind(consoleImpl, styled);
    },
  };
}

export class MemStorage implements IStorage {
  private m = new Map<string, string>();

  get(key: string): string | null {
    return this.m.get(key) ?? null;
  }

  set(key: string, value: string): void {
    this.m.set(key, value);
  }

  del(key: string): void {
    this.m.delete(key);
  }
}

const LEVEL_TO_NUM: Record<LogLevel, number> = {
  trace: 0,
  debug: 1,
  info: 2,
  warn: 3,
  error: 4,
  silent: 5,
};

const M: LogMethod[] = ["trace", "debug", "info", "warn", "error"];

export class Logger {
  private s: IStorage; // storage
  private ls: Map<string | symbol, LoggerInstance> = new Map(); // loggers
  private lvl?: LogLevel;
  private def?: LogLevel;
  private n?: string | symbol;
  private r?: Logger;
  public c: Console = console;
  private e: LoggerOptions;

  trace!: (...args: any[]) => void;
  debug!: (...args: any[]) => void;
  info!: (...args: any[]) => void;
  warn!: (...args: any[]) => void;
  error!: (...args: any[]) => void;

  constructor(
    storage: IStorage,
    opts: LoggerOptions,
    name?: string | symbol,
    root?: Logger,
  ) {
    this.s = storage;
    this.e = opts;
    this.n = name;
    this.r = root;
    this.bindMethods();
  }

  private noop = () => {};

  private bindMethods() {
    M.forEach((method) => {
      const bound = this.e.bind(this.c, method, this.n);

      Object.defineProperty(this, method, {
        get: () => {
          return LEVEL_TO_NUM[method] >= LEVEL_TO_NUM[this.currentLevel()]
            ? bound
            : this.noop;
        },
        configurable: true,
      });
    });
  }

  private storageKey() {
    return this.n ? `loglevel:${String(this.n)}` : "loglevel";
  }

  private currentLevel(): LogLevel {
    if (this.lvl) return this.lvl;

    const stored = this.s.get(this.storageKey());
    if (stored && stored in LEVEL_TO_NUM) {
      this.lvl = stored as LogLevel;
      return this.lvl;
    }

    if (this.def) return this.def;
    if (this.r) return this.r.currentLevel();
    return "trace";
  }

  setLevel(level: LogLevel): Logger {
    this.lvl = level;
    this.s.set(this.storageKey(), level);
    return this;
  }

  setDefaultLevel(level: LogLevel): Logger {
    if (!this.s.get(this.storageKey())) {
      this.def = level;
    }
    return this;
  }

  resetLevel(): Logger {
    this.lvl = undefined;
    this.s.del(this.storageKey());
    return this;
  }

  getLogger(name: string | symbol): LoggerInstance {
    if (!name) throw new Error("Logger name required");

    if (!this.ls.has(name)) {
      const child = new Logger(this.s, this.e, name, this.r || this);
      this.ls.set(name, createProxy(child));
    }

    return this.ls.get(name)!;
  }

  getLoggers(): Record<string, LoggerInstance> {
    const result: Record<string, LoggerInstance> = {};
    this.ls.forEach((logger, name) => {
      result[String(name)] = logger;
    });
    return result;
  }

  use(consoleImpl: Console): void {
    this.c = consoleImpl;
    this.bindMethods();
  }
}

export interface LoggerInstance extends Logger, Omit<Console, keyof Logger> {}

export function createProxy(logger: Logger): LoggerInstance {
  return new Proxy(logger, {
    get(target, prop, receiver) {
      if (prop in target) {
        return Reflect.get(target, prop, receiver);
      }
      const consoleProp = (target.c as any)[prop as any];
      if (typeof consoleProp === "function") {
        return consoleProp.bind(target.c);
      }
      return consoleProp;
    },
  }) as LoggerInstance;
}

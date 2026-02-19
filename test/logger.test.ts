import { describe, expect, it } from "bun:test";
import { Logger, MemStorage, createProxy, type LogMethod } from "../src/logger";

describe("Logger.getLogger prefixes", () => {
  it("prefixes all log methods with symbol and logger name", () => {
    const methods: LogMethod[] = [
      "trace",
      "debug",
      "log",
      "info",
      "warn",
      "error",
    ];

    const calls = new Map<LogMethod, unknown[]>();
    const consoleImpl: Pick<Console, LogMethod> = {
      trace: (...args: unknown[]) => {
        calls.set("trace", args);
      },
      debug: (...args: unknown[]) => {
        calls.set("debug", args);
      },
      log: (...args: unknown[]) => {
        calls.set("log", args);
      },
      info: (...args: unknown[]) => {
        calls.set("info", args);
      },
      warn: (...args: unknown[]) => {
        calls.set("warn", args);
      },
      error: (...args: unknown[]) => {
        calls.set("error", args);
      },
    };

    const symbols: Record<LogMethod | "success", string> = {
      trace: "T",
      debug: "D",
      log: "L",
      info: "I",
      warn: "W",
      error: "E",
      success: "S",
    };

    const logger = new Logger(
      new MemStorage(),
      {
        bind(consoleTarget, method, name) {
          const prefix = name
            ? `${symbols[method]} ${String(name)}:`
            : symbols[method];
          return (consoleTarget[method] || consoleTarget.log).bind(
            consoleTarget,
            prefix,
          );
        },
      },
      consoleImpl as unknown as Console,
    );

    const child = logger.getLogger("api");

    for (const method of methods) {
      child[method]("message");
      const args = calls.get(method);

      expect(args).toBeDefined();
      expect(args?.[0]).toBe(`${symbols[method]} api:`);
      expect(args?.[1]).toBe("message");
    }
  });
});

describe("Logger public API", () => {
  it("returns the same child logger instance and lists it in getLoggers", () => {
    const logger = new Logger(
      new MemStorage(),
      {
        bind(consoleTarget, method, name) {
          const prefix = name ? `${String(name)}:` : "root:";
          return (consoleTarget[method] || consoleTarget.log).bind(
            consoleTarget,
            prefix,
          );
        },
      },
      {
        trace: () => {},
        debug: () => {},
        log: () => {},
        info: () => {},
        warn: () => {},
        error: () => {},
      } as unknown as Console,
    );

    const a = logger.getLogger("api");
    const b = logger.getLogger("api");

    expect(a).toBe(b);

    const loggers = logger.getLoggers();
    expect(Object.keys(loggers)).toEqual(["api"]);
    expect(loggers.api).toBe(a);
  });

  it("applies setLevel, setDefaultLevel, and resetLevel", () => {
    const calls = new Map<LogMethod, number>();
    const hit = (method: LogMethod, args: unknown[]) => {
      calls.set(method, (calls.get(method) || 0) + 1);
    };

    const logger = new Logger(
      new MemStorage(),
      {
        bind(consoleTarget, method) {
          return (consoleTarget[method] || consoleTarget.log).bind(
            consoleTarget,
          );
        },
      },
      {
        trace: (...args: unknown[]) => hit("trace", args),
        debug: (...args: unknown[]) => hit("debug", args),
        log: (...args: unknown[]) => hit("log", args),
        info: (...args: unknown[]) => hit("info", args),
        warn: (...args: unknown[]) => hit("warn", args),
        error: (...args: unknown[]) => hit("error", args),
      } as unknown as Console,
    );

    logger.setDefaultLevel("warn");
    logger.info("info"); // blocked by default warn
    logger.warn("warn"); // allowed
    expect(calls.get("info")).toBeUndefined();
    expect(calls.get("warn")).toBe(1);

    logger.setLevel("error");
    logger.warn("warn"); // blocked by explicit error
    logger.error("error"); // allowed
    expect(calls.get("warn")).toBe(1);
    expect(calls.get("error")).toBe(1);

    logger.resetLevel();
    logger.warn("warn"); // back to default warn, allowed again
    expect(calls.get("warn")).toBe(2);
  });

  it("switches console implementations with use()", () => {
    const first: string[] = [];
    const second: string[] = [];

    const logger = new Logger(
      new MemStorage(),
      {
        bind(consoleTarget, method) {
          return (consoleTarget[method] || consoleTarget.log).bind(
            consoleTarget,
          );
        },
      },
      {
        trace: (...args: unknown[]) => {
          first.push("trace");
        },
        debug: (...args: unknown[]) => {
          first.push("debug");
        },
        log: (...args: unknown[]) => {
          first.push("log");
        },
        info: (...args: unknown[]) => {
          first.push("info");
        },
        warn: (...args: unknown[]) => {
          first.push("warn");
        },
        error: (...args: unknown[]) => {
          first.push("error");
        },
      } as unknown as Console,
    );

    logger.info("first");
    logger.use({
      trace: (...args: unknown[]) => {
        second.push("trace");
      },
      debug: (...args: unknown[]) => {
        second.push("debug");
      },
      log: (...args: unknown[]) => {
        second.push("log");
      },
      info: (...args: unknown[]) => {
        second.push("info");
      },
      warn: (...args: unknown[]) => {
        second.push("warn");
      },
      error: (...args: unknown[]) => {
        second.push("error");
      },
    } as unknown as Console);
    logger.info("second");

    expect(first).toEqual(["info"]);
    expect(second).toEqual(["info"]);
  });

  it("proxies standard console methods (assert, clear, table)", () => {
    const calls = new Map<string, unknown[][]>();

    const record =
      (name: string) =>
      (...args: unknown[]) => {
        const existing = calls.get(name) || [];
        existing.push(args);
        calls.set(name, existing);
      };

    const proxied = createProxy(
      new Logger(
        new MemStorage(),
        {
          bind(consoleTarget, method) {
            return (consoleTarget[method] || consoleTarget.log).bind(
              consoleTarget,
            );
          },
        },
        {
          trace: () => {},
          debug: () => {},
          log: () => {},
          info: () => {},
          warn: () => {},
          error: () => {},
          assert: record("assert"),
          clear: record("clear"),
          table: record("table"),
        } as unknown as Console,
      ),
    );

    proxied.assert(true, "ok");
    proxied.clear();
    proxied.table([{ id: 1 }]);

    expect(calls.get("assert")?.[0]).toEqual([true, "ok"]);
    expect(calls.get("clear")?.[0]).toEqual([]);
    expect(calls.get("table")?.[0]).toEqual([[{ id: 1 }]]);
  });
});

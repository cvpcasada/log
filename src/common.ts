const noop = () => {};

const logMethods = ["trace", "debug", "log", "info", "warn", "error"] as const;

const STORAGE_KEY = "loglevel";

export type LogMethod = (typeof logMethods)[number];

function createHandler(
  level?: LogMethod,
  applyBind?: (level: LogMethod) => Parameters<(typeof console)[LogMethod]>,
  tap?: (
    method: LogMethod,
    args: Parameters<(typeof console)[LogMethod]>
  ) => void,
  ls = {
    getItem: (key: string): string | null => null,
    setItem: (key: string, value: string) => {},
  }
): ProxyHandler<Console> {
  let loglevel = (level ?? ls.getItem(STORAGE_KEY) ?? "trace") as LogMethod;

  return {
    get: (target, prop, receiver) => {
      let index = logMethods.indexOf(prop as LogMethod);

      if (index >= logMethods.indexOf(loglevel)) {
        let method = Reflect.get(target, prop, receiver);

        if (applyBind) {
          method = method.bind(undefined, ...applyBind(prop as LogMethod));
        }

        if (tap) {
          return new Proxy(method, {
            apply: (target, thisArg, args) => {
              tap(prop as LogMethod, args);
              return Reflect.apply(target, thisArg, args);
            },
          });
        }

        return method;
      }

      return noop;
    },
  };
}

const log = new Proxy(console, createHandler());

export { createHandler, log, STORAGE_KEY };

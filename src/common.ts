const noop = () => {};

const logMethods = ["trace", "debug", "info", "log", "warn", "error"] as const;

const STORAGE_KEY = "loglevel";

export let defaultLevel: LogMethod = "trace";
try {
  defaultLevel = localStorage.getItem(STORAGE_KEY) as LogMethod;
} catch {}

export type LogMethod = (typeof logMethods)[number];

export function createHandler(
  level?: LogMethod,
  applyBind?: (level: LogMethod) => Parameters<(typeof console)[LogMethod]>,
  applyCallback?: (
    method: LogMethod,
    args: Parameters<(typeof console)[LogMethod]>
  ) => void
): ProxyHandler<Console> {
  level = level ?? getDefaultLevel();

  return {
    get: (target, prop, receiver) => {
      let index = logMethods.indexOf(prop as LogMethod);

      if (index >= logMethods.indexOf(level)) {
        let method = Reflect.get(target, prop, receiver);

        if (applyBind) {
          method = method.bind(undefined, ...applyBind(prop as LogMethod));
        }

        if (applyCallback) {
          return new Proxy(method, {
            apply: (target, thisArg, args) => {
              applyCallback(prop as LogMethod, args);
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

export const log = new Proxy(console, createHandler());

export function setDefaultLevel(level: LogMethod) {
  defaultLevel = level;
  try {
    localStorage.setItem(STORAGE_KEY, level);
  } catch {}
}

export function getDefaultLevel() {
  try {
    return (localStorage.getItem(STORAGE_KEY) as LogMethod) ?? defaultLevel;
  } catch {
    return defaultLevel;
  }
}

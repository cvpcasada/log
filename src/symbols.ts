import type { LogMethod } from "./common.js";

const main = {
  info: "⚡️",
  success: "✔",
  warn: "▲",
  error: "✖",
  log: "●",
  trace: "◔",
  debug: "◌",
} as { readonly [key in LogMethod]: string };

const fallback = {
  info: "i",
  success: "√",
  warn: "‼",
  error: "×",
  log: "•",
  trace: "»",
  debug: "*",
} as { readonly [key in LogMethod]: string };

export { main, fallback };
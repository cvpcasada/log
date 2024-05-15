
import { defineConfig } from "tsup";

const env = process.env.NODE_ENV;

export default defineConfig({
  sourcemap: env === "prod",
  clean: true,
  dts: {
    resolve: true,
  },
  splitting: false,
  format: ["esm"],
  bundle: env === "production",
  watch: env === "development",
  outDir: env === "production" ? "dist" : "lib",
  entry: ["src/index.ts", 'src/browser.ts'],
});


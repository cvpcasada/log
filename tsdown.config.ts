import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: {
    server: './src/server.ts',
    browser: './src/browser.ts',
  },
  platform: 'neutral',
  dts: {
    oxc: true,
  },
})

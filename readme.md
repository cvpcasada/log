# @cyca/log

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A lightweight, feature-rich logging library for JavaScript/TypeScript applications that works seamlessly in both browser and Node.js environments.

## Features

- 🎨 **Colored console output** with Unicode symbols
- 📱 **Dual environment support** - Browser (localStorage) and Server (memory)
- 🔧 **Configurable log levels** with persistent storage
- 🏗️ **Hierarchical loggers** with named instances
- 🎛️ **Custom console implementations**
- 📦 **TypeScript support** with full type definitions
- 🚀 **Modern ES modules** with tree-shakeable exports

## Installation

```bash
npm install @cyca/log
```

```bash
yarn add @cyca/log
```

```bash
pnpm add @cyca/log
```

```bash
bun add @cyca/log
```

## Quick Start

### Basic Usage

```javascript
import { log } from '@cyca/log';

// Simple logging
log.info('Application started');
log.warn('This is a warning');
log.error('Something went wrong');

// Different environments automatically detected:
// - Browser: uses localStorage for persistence
// - Server: uses in-memory storage
```

## Log Levels

The library supports six log levels:

- `trace` - Most verbose, typically for debugging
- `debug` - Debug information
- `info` - General information (default)
- `warn` - Warning messages
- `error` - Error messages
- `silent` - Disable all logging

```javascript
import { log } from '@cyca/log';

log.trace('Detailed debugging info');
log.debug('Debug information');
log.info('General information');
log.warn('Warning message');
log.error('Error message');

// Set minimum log level
log.setLevel('warn');
```

## Named Loggers

Create hierarchical loggers for different parts of your application:

```javascript
import { log } from '@cyca/log';

const apiLogger = log.getLogger('api');
const dbLogger = log.getLogger('database');
const authLogger = log.getLogger('auth');

// Different loggers can have different levels
apiLogger.setLevel('debug');
dbLogger.setLevel('error');

// Usage
apiLogger.debug('API request received');
dbLogger.error('Database connection failed');
authLogger.info('User authenticated');
```

## Persistent Log Levels

Log levels are automatically persisted:

```javascript
import { log } from '@cyca/log';

// Set log level (persisted across sessions)
log.setLevel('error');

// Reset to default
log.resetLevel();

// Set default level (only if no stored level exists)
log.setDefaultLevel('info');
```

## Custom Console Implementation

Use a custom console implementation:

```javascript
import { log } from '@cyca/log';
import electronLog from 'electron-log/renderer';

log.use(electronLog);
```

## Advanced Usage

### TypeScript Support

Full TypeScript definitions are included:

```typescript
import { log, Logger, LogLevel, LoggerInstance } from '@cyca/log';

const logger: LoggerInstance = log.getLogger('myModule');

// Logger instances extend the standard Console interface
logger.assert(condition, message);
logger.clear();
logger.table(data);
```

### Environment Detection

The library automatically detects the environment:

- **Browser**: Uses `localStorage` for persistence and CSS-styled console output
- **Node.js**: Uses in-memory storage and ANSI color codes

## API Reference

### Main Exports

- `log` - Default logger instance
- `Logger` - Main logger class
- `LogLevel` - Log level type
- `LoggerInstance` - Logger instance type
- `IStorage` - Storage interface
- `LoggerOptions` - Logger configuration options

### Logger Methods

```typescript
class Logger {
  // Log methods (automatically bound based on level)
  trace(...args: any[]): void
  debug(...args: any[]): void
  info(...args: any[]): void
  warn(...args: any[]): void
  error(...args: any[]): void

  // Level management
  setLevel(level: LogLevel): this
  setDefaultLevel(level: LogLevel): this
  resetLevel(): this

  // Logger management
  getLogger(name: string | symbol): LoggerInstance
  getLoggers(): Record<string, LoggerInstance>

  // Console management
  use(consoleImpl: Console): void
}
```

## License

MIT © [Cyrus Venn Casada](https://github.com/cvpcasada)

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

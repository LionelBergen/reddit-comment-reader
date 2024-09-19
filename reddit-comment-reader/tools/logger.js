import { createLogger, format, transports } from 'winston';
import { printf as fastprintf } from 'fast-printf';

const { combine, timestamp, label, printf } = format;

const TS_FORMAT = (new Date()).toLocaleTimeString();
const LOG_FILE = 'reddit-comment-reader.log';
const ERROR_LOG_FILE = 'reddit-comment-reader-errors';

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${fastprintf('%-20s', label)}] ${fastprintf('%5s', level)}: ${message}`;
});

class LogLocal {
  createInstance(logLabel) {
    return createLogger({
      format: combine(
        label({ label: logLabel }),
        timestamp(),
        myFormat
      ),
      transports: [
        new transports.Console({
          timestamp: TS_FORMAT,
          colorize: true,
          level: 'info'
        }),
        new transports.File({
          filename: ERROR_LOG_FILE,
          level: 'error'
        }),
        new transports.File({
          filename: LOG_FILE,
          level: 'debug'
        })
      ]
    });
  }
}

class LogHeroku {
  createInstance(logLabel) {
    return new ConsoleLogger(logLabel);
  }
}

class ConsoleLogger {
  constructor(label) {
    this.label = label;
  }

  debug(message) {
    console.debug(this.label + ": " + message);
  }

  info(message) {
    console.log(this.label + ": " + message);
  }

  error(message) {
    console.error(this.label + ": " + message);
  }
}

class SimpleConsoleLogger {
  constructor() {
  }

  debug(message) {
    console.debug(message);
  }

  info(message) {
    console.log(message);
  }

  error(message) {
    console.error(message);
  }
}

// We only need 1 instance of this class
export default (process.env._ && process.env._.indexOf("heroku")) ? new LogHeroku() : new LogLocal();

export function CreateSimpleLogger(testName) { 
  return new SimpleConsoleLogger(testName);
}

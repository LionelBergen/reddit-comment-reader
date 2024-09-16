const {createLogger, format, transports} = require('winston');
const { combine, timestamp, label, printf } = format;
const quickFormat = require('fast-printf');

const TS_FORMAT = (new Date()).toLocaleTimeString();
const LOG_FILE = 'reddit-comment-reader.log';
const ERROR_LOG_FILE = 'reddit-comment-reader-errors';

const myFormat = printf(({ level, message, label, timestamp }) => {
  return `${timestamp} [${quickFormat.printf('%-20s', label)}] ${quickFormat.printf('%5s', level)}: ${message}`;
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
    console.log(this.label + ": " + message);
  }

  info(message) {
    console.log(this.label + ": " + message);
  }

  error(message) {
    console.log(this.label + ": " + message);
  }
}

// We only need 1 instance of this class
module.exports = (process.env._ && process.env._.indexOf("heroku")) ? new LogHeroku() : new LogLocal();
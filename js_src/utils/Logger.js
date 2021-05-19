import {EventDispatcher} from "./EventDispatcher.js";
import {CHANGE} from "./constants.js";

export class Logger extends EventDispatcher {
  constructor () {
    super();
    this.level = Logger.DEBUG;
  }

  announce (value) {
    this.dispatchChange(Logger.ANNOUNCE, value);
  }

  debug (value) {
    this.dispatchChange(Logger.DEBUG, value);
  }

  info (value) {
    this.dispatchChange(Logger.INFO, value);
  }

  warn (value) {
    this.dispatchChange(Logger.WARN, value);
  }

  fatal (value) {
    this.dispatchChange(Logger.FATAL, value);
  }

  dispatchChange (level, value) {
    if (this.level <= level) {
      this.dispatchEvent(CHANGE, {level: level, levelName: Logger.LEVEL_NAMES[level+1], msg: value, time: new Date()});
    }
  }
}
Logger.DEBUG = 1;
Logger.INFO = 2;
Logger.WARN = 3;
Logger.ANNOUNCE = 4;
Logger.FATAL = 5;

Logger.LEVEL_NAMES = ['DEBUG', 'INFO', 'WARN', 'ANNOUNCE', 'FATAL'];

// As a convenience, provide a Logger singleton instance for applications to use globally.
Logger.logger = () => {
  if (Logger.LOG === undefined || Logger.LOG === null) {
    Logger.LOG = new Logger();
  }

  return Logger.LOG;
}

import {
  CHANGE
} from './constants.js';
import {Logger} from './Logger.js';

/**
 * Displays messages from Logger in the web browser console.
 */
export class ConsoleLogger {
  constructor (logger) {
    this.logger = logger;
    this.logger.on(CHANGE, this.handleChange.bind(this));
  }

  handleChange (e) {
    switch (e.detail.level) {
      case Logger.ANNOUNCE:
        console.info(e.detail.msg);
        break;

      case Logger.INFO:
        console.log(e.detail.msg);
        break;

      case Logger.WARN:
        console.warn(e.detail.msg);
        break;

      case Logger.FATAL:
        console.error(e.detail.msg);
        break;

      default:
        break;
    }
  }
}

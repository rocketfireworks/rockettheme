import {Logger} from './Logger.js';

export function log (value) {
  Logger.logger().info(value);
}

export function warn (value) {
  Logger.logger().warn(value);
}

export function fatal (value) {
  Logger.logger().fatal(value);
}

export function announce (value) {
  Logger.logger().announce(value);
}

import {EventDispatcher} from './EventDispatcher.js';
import {
  COMPLETE,
  CHANGE,
  FAIL
} from './constants.js';
import {log} from './logfunctions.js';

/**
 * An individual task to be executed by a TaskManager or individually by manually invoking start().
 */
export class Task extends EventDispatcher {
  constructor () {
    super();
    this.name = '';
    this.complete = false;
    this.startTime = 0;
    this.progress = 0;  // Not supported by all Task subclasses
    this.executionDuration = 0;
  }

  /**
   * Begins the task. Subclasses provide concrete implementations for this "abstract" method.
   */
  start () {
    log(`Task start: [${this.name}]`);
    this.startTime = new Date();
    this.complete = false;
  }

  /**
   * Sets and broadcasts the amount of the task that has been completed, as a percentage. Subclasses
   * determine how to measure the percentage; however, subclasses are not obliged to report progress.
   *
   * @param percent A floating point indicating progress as a percentage. Example: .5 (half done)
   */
  setProgress (percent) {
    if (!this.complete) {
      this.progress = percent;
      this.dispatchEvent(CHANGE, {progress: percent});
    } else {
      throw new Error(`Task [${this.name}] invoked progress() after completion.`);
    }
  }

  /**
   * Officially registers the task as completed. Invoked by subclasses based on implementation-specific
   * definition of "task completion."
   */
  done () {
    if (!this.complete) {
      let now = new Date();
      this.executionDuration = now.getTime() - this.startTime.getTime();
      this.complete = true;
      let taskDurationString = this.executionDuration < 999 ? `${this.executionDuration}ms` : `${this.executionDuration/1000}s`
      log(`Task complete: [${this.name}] (duration: ${taskDurationString}).`);
      this.dispatchEvent(COMPLETE);
    } else {
      throw new Error(`Task [${this.name}] invoked done() after completion.`);
    }
  }

  /**
   * Indicates that the task did not complete successfully.
   *
   * Example:
   * someTask.fail(new Error('Could not complete task'));
   *
   * @param error An Error or Error subclass instance.
   */
  fail (error) {
    if (!this.complete) {
      let now = new Date();
      this.executionDuration = now.getTime() - this.startTime.getTime();
      this.complete = true;
      this.dispatchEvent(FAIL, {error: error});
    } else {
      throw new Error(`Task [${this.name}] invoked fail() after completion.`);
    }
  }
}

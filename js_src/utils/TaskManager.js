import {EventDispatcher} from './EventDispatcher.js';
import {COMPLETE, FAIL, START, TASK_END, TASK_START} from './constants.js';
import {notNil} from './utils.js';
import {announce} from './logfunctions.js';

/**
 * A generic task manager for executing a ordered list of tasks, such as a boot sequence. Each
 * task in the sequence is a Task object, or a nested TaskManager instance. When a given task is
 * a TaskManager instance, all subtasks are executed before the parent task list resumes.
 *
 * Example (showing nested tasks):
 *
 * let connectionTasks = [
 *   new GetRequiredURLParamsTask(),
 *   new GetMRTSRouteTask(),
 *   new StartMRTSEndpointMonitorTask(),
 *   new MRTSConnectionTask()
 * ];
 * let contentTasks = [
 *   new LoadDeploymentCSSTask(),
 *   new LoadMediaTask(),
 *   new LoadThemesTask(),
 *   new CreateRunViewsTask(),
 *   new ApplyDeploymentSettingsTask()
 * ];
 *
 * let contentTaskManager = new TaskManager('ContentManager');
 * contentTaskManager.addTasks(contentTasks);
 *
 * // Configure boot sequence
 * bootManager.on(COMPLETE, e => {
 *   // App is ready...
 * });
 * bootManager.on(FAIL, e => {
 *  console.log(`Boot failed at task: ${e.detail.name}.`));
 * });
 *
 * // Add an array of Tasks to the boot sequence
 * bootManager.addTasks(connectionTasks);
 *
 * // Add an entire TaskManager to the boot sequence
 * bootManager.addTasks(contentTaskManager);
 *
 * // Boot application (begin list of tasks)
 * bootManager.start();
 *
 */
export class TaskManager extends EventDispatcher {
  constructor (name) {
    super();
    this.name = name;
    this.tasks = [];
    this.complete = false;
    this.startTime = 0;
    this.executionDuration = 0;
    this.currentTaskIndex = -1;
    // Retrieve and store a reference to each task listener with the "this" object bound to
    // TaskManager. These references are used to register for task events without the risk of
    // registering multiple anonymous listener functions for the same event. Ideally, it would
    // be preferred to just register the listener functions directly, but doing so would lose the
    // 'this' within those functions. This is a known general risk to be managed when registering
    // event listeners in JavaScript.
    this.boundCompleteListener = this.taskCompleteListener.bind(this);
    this.boundFailedListener = this.taskFailedListener.bind(this);
  }

  /**
   * Adds one or more tasks to the list of tasks to be performed.
   *
   * @param tasks An array of tasks or an individual task.
   */
  addTasks (tasks) {
    if (notNil(tasks)) {
      this.tasks = this.tasks.concat(tasks);
      this.tasks.forEach((task) => {
        task.on(COMPLETE, this.boundCompleteListener);
        task.on(FAIL, this.boundFailedListener);
      });
    }
  }

  start () {
    announce(`${this.name} tasks starting.`);
    this.complete = false;
    this.startTime = new Date();
    this.dispatchEvent(START);
    this.currentTaskIndex = -1;
    this.nextTask();
  }

  nextTask () {
    this.currentTaskIndex++;
    if (this.currentTaskIndex < this.tasks.length) {
      let currentTask = this.tasks[this.currentTaskIndex];
      this.dispatchEvent(TASK_START, currentTask);
      currentTask.start();
    } else {
      let now = new Date();
      this.executionDuration = now.getTime() - this.startTime.getTime();
      this.complete = true;
      // Log completion here so complete listeners don't log "post complete" messages before
      // the "complete" message.
      announce(`${this.name} tasks complete. Total time to complete all tasks: ${this.executionDuration/1000}s`);
      this.dispatchEvent(COMPLETE, {executionDuration: this.executionDuration});
    }
  }

  taskCompleteListener (e) {
    this.dispatchEvent(TASK_END, e.detail.target);
    this.nextTask();
  }

  taskFailedListener (e) {
    this.dispatchEvent(FAIL, {name: e.detail.target.name, error: e.detail.error});
  }

  getTaskByName (name) {
    let taskIndex = this.tasks.findIndex(task => task.name === name);
    return taskIndex === -1 ? null : this.tasks[taskIndex];
  }
}

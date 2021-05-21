/**
 * Indicates whether a value exists and can be operated on. This function is provides a standardized
 * mechanism for writing code that avoids triggering reference errors.
 */
function isNil (value) {
  // null, undefined, and NaN are blank
  return value === null || value === undefined || Number.isNaN(value);
}

function notNil (value) {
  return !isNil(value);
}

/**
 * Returns true if value is any of the following:
 * null
 * undefined
 * NaN
 * empty string
 * empty array
 * empty Map
 * empty Set
 * object with no properties
 */
function isEmpty (value) {
  if (isNil(value)) {
    return true;
  } else {
    if (typeof value === 'string' || value instanceof Array) {
      return value.length === 0;
    }
    if (value instanceof Set || value instanceof Map) {
      return value.size === 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
  }
  return false;
}

function notEmpty (value) {
  return !isEmpty(value);
}

/**
 * Returns true if the supplied url (string) is a relative URL such as "../config.json". Otherwise,
 * if the supplied url is an absolute URL such as "http://example.com/config.json", returns false.
 * This function requires a browser-supplied document object or equivalent.
 *
 * @param url A string URL.
 * @returns {boolean}
 */
function isRelativeURL (url) {
  return new URL(document.baseURI).origin === new URL(url, document.baseURI).origin;
}

function sumProducts (products) {
  return products.reduce(function(prev, cur) {
    let thisVal = parseFloat(cur.product.variants[0].price);
    return prev + thisVal;
  }, 0);
}

/**
 * Dispatches events for plain JavaScript objects.
 *
 * To access the dispatching object from an Event object, use e.detail.target.
 */
class EventDispatcher {
  constructor () {
    this.proxyElement = document.createTextNode('');
    this.off = this.proxyElement.removeEventListener.bind(this.proxyElement);
    this.on = this.proxyElement.addEventListener.bind(this.proxyElement);
  }

  dispatchEvent (eventName, data = {}) {
    if (notNil(eventName)) {
      let e = new CustomEvent(eventName, {'detail':data});
      if (!data.hasOwnProperty('target')) {
        data.target = this;
      }
      this.proxyElement.dispatchEvent(e);
    }
  }
}

const START = 'start';
const COMPLETE = 'complete';
const CHANGE = 'change';
const FAIL = 'FAIL';
const TASK_START = 'task_start';
const TASK_END = 'task_end';

// HTTP Methods
const GET = 'GET';
const POST = 'POST';

class Logger extends EventDispatcher {
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
};

function log (value) {
  Logger.logger().info(value);
}

function fatal (value) {
  Logger.logger().fatal(value);
}

function announce (value) {
  Logger.logger().announce(value);
}

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
class TaskManager extends EventDispatcher {
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

/**
 * An individual task to be executed by a TaskManager or individually by manually invoking start().
 */
class Task extends EventDispatcher {
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
      let taskDurationString = this.executionDuration < 999 ? `${this.executionDuration}ms` : `${this.executionDuration/1000}s`;
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

/**
 * A load error triggered by a failed HTTP request. Used by fetch() Promise handlers to branch
 * between various types of load failures.
 */
class LoadError extends Error {
  constructor(HTTPStatus, uri, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8).
    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LoadError);
    }

    this.name = 'LoadError';
    // The HTTP response status for the failure (e.g., 400, 403, 503)
    this.HTTPStatus = HTTPStatus;
    // The original URI requested
    this.uri = uri;
  }
}

/**
 * A generic HTTP load task. If the HTTP request completes with response status 200-299, LoadTask
 * dispatches COMPLETE. Otherwise, LoadTask dispatches FAIL, with either LoadError (for HTTP failures
 * such as 404, 503, etc), or Error (for generic failures such as no internet or permission denied).
 */
class LoadTask extends Task {
  /**
   * LoadTask constructor function.
   *
   * @param url The URL to load. If the URL is relative, the full path is resolved relative to the
   *            document.baseURI.
   * @param headersObj The HTTP headers for the request, as key/value pairs on a plain JavaScript object.
   * @param nocache If true, LoadTask will append a query string to attempt to prevent the requested
   *                resource from being cached by the browser.
   * @param params Query string parameters for the request, as a generic JavaScript object whose
   *               properties are the key/value query-string pairs.
   * @param method The HTTP method (e.g., GET, DELETE, POST).
   * @param body The request body (does not apply to GET requests).
   */
  constructor (url, {headersObj = null, nocache = false, params = {}, method = GET, body = null} = {}) {
    super();
    this.name = 'LOAD';
    this.url = url;
    this.headers = headersObj;
    this.nocache = nocache;
    this.params = params;
    this.method = method;
    this.body = body;
  }

  start () {
    super.start();

    // Create the URL object. If the supplied URL is a relative URL, automatically include the
    // required base URL string.
    let url;
    if (isRelativeURL(this.url)) {
      url = new URL(this.url, document.baseURI);
    } else {
      url = new URL(this.url);
    }

    if (this.nocache === true) {
      this.params.nocache = new Date().getTime().toString();
    }

    // Assign query params to url object
    Object.keys(this.params).forEach(key => url.searchParams.append(key, this.params[key]));

    // Create fetch() init object
    let fetchInit = {};
    if (notEmpty(this.headers)) {
      fetchInit.headers = this.headers;
    }
    if (notEmpty(this.method)) {
      fetchInit.method = this.method;
    }
    // body is not allowed with GET requests, and will trigger an error if present, so don't add
    // body to fetchInit if the method request is GET, even if body has a value.
    if (notEmpty(this.body) && this.method !== GET) {
      fetchInit.body = this.body;
    }

    // Start network request
    fetch(url, fetchInit).then(response => {
      // The fetch() Promise was fulfilled, but the HTTP request itself might have returned a failure
      // such as 404. When a fetch() request yields a 404 response, response.ok will be false.
      this.response = response;
      if (response.ok) {
        this.handleSuccess(response);
      } else {
        // The HTTP request failed.
        this.fail(new LoadError(response.status, response.url));
      }
    })
    .catch(error => {
      this.fail(new Error('Load failed. Possible causes: No internet available or permission denied.'));
    });
  }

  handleSuccess (response) {
    this.done();
  }
}

/**
 * Loads the JSON at the specified endpoint. If the load is successful, the loaded JSON can be
 * accessed via the LoadJSONTask object's .json property.
 *
 * Example with HTTP Authorization header:
 * let loadJSONTask = new LoadJSONTask(connectionConfigurationsURL,
 *   {
 *     headersObj:
 *       {
 *         'Authorization':
 *         `Token token=${someSessionToken}`
 *       }
 *   });
 * loadJSONTask.on(COMPLETE, () => {
 *   SomeApp.globals.dataStore.megaphoneToken = get(loadJSONTask.json, 'megaphone_token');
 * });
 *
 * loadJSONTask.on(FAIL, (e) => {
 *   // Data failed to load
 *   let error = e.detail.error;
 *   if (error instanceof LoadError) {
 *     if (error.HTTPStatus === 404) {
 *       fatal(`Not found. URI: ${error.uri}`);
 *     } else {
 *       fatal(`Error. HTTP status ${error.HTTPStatus}. URI: ${error.uri}`);
 *     }
 *   } else {
 *     fatal('Failed to load JSON. Either the Internet connection is unavailable '
 *           + 'or an error occurred retrieving the data.');
 *   }
 * });
 *
 * loadJSONTask.start();
 */
class LoadJSONTask extends LoadTask {
  constructor (url, {headersObj = null, nocache = false, params = {}, method = GET, body = null} = {}) {
    super(url,  {headersObj: headersObj, nocache: nocache, params: params, method: method, body: body});
    this.name = 'LOAD_JSON';
    this.json = null;
  }

  handleSuccess (response) {
    response.json().then(json => {
      this.json = json;
      this.done();
    });
  }
}

class ShopifyCart {
}

ShopifyCart.getAddToCartTask = function (variantID) {
  let bodyData = {
    'items': [{
      'id': variantID,
      'quantity': 1
    }]
  };
  let url = '/cart/add.js';

  return this.getLoadJSONTask(url, bodyData);
};

ShopifyCart.getRemoveFromCartTask = function (variantID) {
  return this.getUpdateCartTask(variantID, 0);
};

ShopifyCart.getUpdateCartTask = function (variantID, quantity) {
  let bodyData = {};
  bodyData.updates = {};
  bodyData.updates[variantID] = quantity;
  let url = '/cart/update.js';

  return this.getLoadJSONTask(url, bodyData);
};

ShopifyCart.getLoadJSONTask = function (url, bodyData) {
  let loadJSONTask = new LoadJSONTask(url,
    {
      headersObj: {
        'Content-Type': 'application/json'
      },
      method: POST,
      body: JSON.stringify(bodyData)
    });

  loadJSONTask.on(COMPLETE, () => {
    console.log('Task complete!');
  });

  loadJSONTask.on(FAIL, (e) => {
    // Data failed to load
    let error = e.detail.error;
    if (error instanceof LoadError) {
      if (error.HTTPStatus === 404) {
        fatal(`Not found. URI: ${error.uri}`);
      } else {
        fatal(`Error. HTTP status ${error.HTTPStatus}. URI: ${error.uri}`);
      }
    } else {
      fatal('Failed to load JSON. Either the Internet connection is unavailable '
        +'or an error occurred retrieving the data.');
    }
  });

  return loadJSONTask;
};

class BonusRewards {
  constructor () {
    log('BonusRewards 4.0 manager ready.');

    this.updateRewards(BonusRewards.level1ID, BonusRewards.level2ID);
  }

  updateRewards (removeID, addID) {
    let tasks = [];
    if (notNil(removeID)) {
      tasks.push(ShopifyCart.getRemoveFromCartTask(removeID));
    }
    if (notNil(addID)) {
      tasks.push(ShopifyCart.getAddToCartTask(addID));
    }

    this.rewardsManager = new TaskManager('Rewards Manager');
    this.rewardsManager.addTasks(tasks);
    this.rewardsManager.on(COMPLETE, e => {
      log('RewardsManager finished adding/removing item.');
    });
    this.rewardsManager.on(FAIL, e => {
      log('RewardsManager failed to complete tasks.');
    });

    this.rewardsManager.start();
  }
}

BonusRewards.level1ID = 39310116454589;
BonusRewards.level2ID = 39310858420413;
BonusRewards.level3ID = 39310870708413;
BonusRewards.level4ID = 39310873297085;
BonusRewards.level5ID = 39310876115133;
BonusRewards.level6ID = 39310879195325;
BonusRewards.level7ID = 39310912815293;
BonusRewards.level8ID = 39310917664957;
BonusRewards.level9ID = 39310919336125;
BonusRewards.level10ID = 39310922252477;

/**
 * Displays messages from Logger in the web browser console.
 */
class ConsoleLogger {
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
    }
  }
}

class ReleaseInfo {
  constructor (title, version, date) {
    this.title = title;
    this.version = version;
    this.date = date;
  }
}

/**
 * Main application entry point.
 */

class RocketTheme {
  boot () {
    // Create logger first so all other code in the application can access it
    RocketTheme.globals.logger = Logger.logger();
    this.consoleLogger = new ConsoleLogger(RocketTheme.globals.logger);

    // Create Bonus Rewards manager
    this.bonusRewards = new BonusRewards();

    RocketTheme.globals.releaseInfo = new ReleaseInfo('Rocket Dev Theme', '1.1.0', 'Wed May 19 2021 10:55:45 GMT-0400 (Eastern Daylight Time)');

    log(`RocketTheme ${RocketTheme.globals.releaseInfo.title} ${RocketTheme.globals.releaseInfo.version} boot complete.`);
    log(`Last compiled: ${RocketTheme.globals.releaseInfo.date}`);
  }
}

RocketTheme.globals = {};

// Main JavaScript entry point.
// Starts the application by instantiating the main application class...
const rocketTheme = new RocketTheme();
rocketTheme.boot();
//# sourceMappingURL=rocket-js-compiledtheme.js.map

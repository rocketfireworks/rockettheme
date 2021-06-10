const START = 'start';
const COMPLETE = 'complete';
const CHANGE = 'change';
const FAIL = 'FAIL';
const TASK_START = 'task_start';
const TASK_END = 'task_end';

// HTTP Methods
const GET = 'GET';

// THEME CONSTANTS
const TAG_FW = 'FW';
const TAG_FWSEQ = 'FWSEQ';

class BonusReward {

  constructor (level, id, index) {
    this.level = level;
    this.id = id;
    this.index = index;
  }
  
}

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

/**
 * Returns the sum of the objects in the array for the specified prop.
 */
function sumBy (array, prop) {
  return array.reduce(function(prev, cur) {
    return prev + cur[prop];
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

const FIREWORKS_TOTAL_IN_CART_UPDATED$1 = 'FIREWORKS_TOTAL_IN_CART_UPDATED';
const BONUS_REWARD_UPDATED = 'BONUS_REWARD_UPDATED';
const SHOPIFY_CART_UPDATE$1 = 'SHOPIFY_CART_UPDATE';
const UPDATE$1 = 'UPDATE';

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

ShopifyCart.getCartTask = function () {
  let getCartTask = ShopifyCart.getLoadJSONTask('/cart.js', 'GET');
  getCartTask.name = 'GET CART';
  return getCartTask;
};

ShopifyCart.getProductTask = function (productURL) {
  let getProductTask = ShopifyCart.getLoadJSONTask( productURL, 'GET');
  getProductTask.name = `GET PRODUCT: ${productURL}`;
  return getProductTask;
};

ShopifyCart.getAddToCartTask = function (variantID) {
  let bodyData = {
    'items': [{
      'id': variantID,
      'quantity': 1
    }]
  };
  let url = '/cart/add.js';

  let addToCartTask = ShopifyCart.getLoadJSONTask(url, 'POST', bodyData);
  addToCartTask.name = 'ADD TO CART';
  
  return addToCartTask;
};

ShopifyCart.getRemoveFromCartTask = function (variantID) {
  let removeFromCartTask = ShopifyCart.getUpdateCartTask(variantID, 0);
  removeFromCartTask.name = 'REMOVE FROM CART';
  
  return removeFromCartTask;
};

ShopifyCart.getUpdateCartTask = function (variantID, quantity) {
  let bodyData = {};
  bodyData.updates = {};
  bodyData.updates[variantID] = quantity;
  let url = '/cart/update.js';

  let updateItemTask = ShopifyCart.getLoadJSONTask(url, 'POST', bodyData);
  updateItemTask.name = 'UPDATE CART';

  return updateItemTask;
};

ShopifyCart.getLoadJSONTask = function (url, method, bodyData = null) {
  let loadJSONTaskParams = {
      headersObj: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/javascript'
      },
      method: method
    };
  if (notNil(bodyData)) {
    loadJSONTaskParams.body = JSON.stringify(bodyData);
  }

  let loadJSONTask = new LoadJSONTask(url, loadJSONTaskParams);

  loadJSONTask.on(COMPLETE, () => {
    // Task complete
    console.log('* Finished task successfully: ', loadJSONTask.name);
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

class ProductService {
}

ProductService.getProduct = function (handle) {
  return RocketTheme.globals.dataStore.productsInCart.find(element => element.product.handle === handle);
};

ProductService.hasTag = function (handle, tag) {
  let productObj = ProductService.getProduct(handle);
  if (isNil(productObj)) {
    console.warn(`ProductService.hasTag() could not find a product with the requested handle: [${handle}] (tag: [${tag}])`);
    return false;
  } else {
    return productObj.product.tags.includes(tag) || productObj.product.tags.includes(tag.toLowerCase());
  }
};

ProductService.isFireworkProduct = function (handle) {
  return ProductService.hasTag(handle, TAG_FW) || ProductService.hasTag(handle, TAG_FWSEQ);
};

ProductService.getVariantID = function (product) {
  return product.product.variants[0].id;
};

const FIREWORKS_TOTAL_IN_CART_UPDATED = 'FIREWORKS_TOTAL_IN_CART_UPDATED';
const SHOPIFY_CART_UPDATE = 'SHOPIFY_CART_UPDATE';
const UPDATE = 'UPDATE';

class RefreshCartWatcherTask extends Task {
  constructor (cartWatcher) {
    super();
    this.name = 'REFRESH CART WATCHER';
    this.cartWatcher = cartWatcher;
    this.waitForCartWatcherIntervalID = -1;
  }

  start () {
    super.start();
    // If there's a refresh() in progress, wait for that to complete before requesting a new one.
    if (this.cartWatcher.refreshInProgress) {
      this.waitForCartWatcherIntervalID = setInterval(() => {
        if (!this.cartWatcher.refreshInProgress) {
          clearInterval(this.waitForCartWatcherIntervalID);
          this.waitForCartWatcherIntervalID = -1;
          this.requestRefresh();
        }
      }, 500);
    } else {
      this.requestRefresh();
    }
  }

  requestRefresh () {
    this.boundUpdateListener = this.cartWatcherUpdateListener.bind(this);
    this.cartWatcher.on(UPDATE, this.boundUpdateListener);
    this.cartWatcher.refresh();
  }

  cartWatcherUpdateListener () {
    // CartWatcher has been created and finished its first refresh, so the init task is done
    this.cartWatcher.off(UPDATE, this.boundUpdateListener);
    this.done();
  }
}

class UpdateBonusRewardsInCartTask extends TaskManager {
  constructor (bonusRewardToAdd) {
    super('UPDATE BONUS REWARDS IN CART');

    this.initTasks(bonusRewardToAdd);
  }

  initTasks (bonusRewardToAdd) {
    let tasks = this.getRemoveAllBonusRewardsFromCartTasks();

    if (notNil(bonusRewardToAdd)) {
      let addActiveBonusRewardTask = this.getAddBonusRewardToCartTask(bonusRewardToAdd);
      tasks.push(addActiveBonusRewardTask);
    }

    // IMPORTANT:
    // After the bonus rewards have been removed from and added to the server-side cart, retrieve
    // the cart's state again so the local cart reflects the changed bonus rewards.
    // Without this refresh, the on-screen cart would appear out of date (i.e., would not correctly
    // show the current bonus reward).
    tasks.push(new RefreshCartWatcherTask(RocketTheme.globals.cartWatcher));
    
    this.addTasks(tasks);
  }

  start() {
    super.start();
  }

  getRemoveAllBonusRewardsFromCartTasks () {
    let removeTasks = [];
    console.log('* Removing all bonus rewards from cart');
    RocketTheme.globals.dataStore.productsInCart.forEach(productObj => {
      BonusRewards.levels.forEach(bonus => {
        let variantID = ProductService.getVariantID(productObj);
        if (variantID === bonus.id) {
          removeTasks.push(ShopifyCart.getRemoveFromCartTask(variantID));
          console.log('* Queuing bonus reward for removal:', bonus);
        }
      });
    });
    return removeTasks;
  }

  getAddBonusRewardToCartTask (bonusReward) {
    console.log('* Queuing bonus reward for addition:', bonusReward);
    return ShopifyCart.getAddToCartTask(bonusReward.id);
  }
}

class BonusRewards extends EventDispatcher {
  constructor () {
    super();
    this.activeBonusReward = null;
    this.nextBonusReward = null;

    this.remainingUntilNextLevel = 0;
    this.progressPercentage = 0;

    this.updateBonusRewardInProgress = false;
    this.updateBonusRewardCheckBuffered = false;
  }

  //================================================================================================
  // DEPENDENCIEES
  //================================================================================================

  setCartWatcher (cartWatcher) {
    this.cartWatcher = cartWatcher;
    this.cartWatcher.on(FIREWORKS_TOTAL_IN_CART_UPDATED$1, this.fireworksTotalUpdatedListener.bind(this));
    this.cartWatcher.on(UPDATE$1, this.cartWatcherUpdatedListener.bind(this));
  }

  //================================================================================================
  // BONUS REWARDS MANAGEMENT
  //================================================================================================

  refresh () {
    this.activeBonusReward = this.getActiveBonusReward();
    this.nextBonusReward = this.getNextBonusReward();
    this.remainingUntilNextLevel = this.getRemainingUntilNextLevel();
    this.progressPercentage = this.getProgressPercentage();
    if (this.getActiveBonusRewardHasChanged()) {
      this.handleActiveBonusRewardChange();
    }
  }

  fireworksTotalUpdatedListener () {
    console.log('* BonusRewards caught CartWatcher FIREWORKS_TOTAL_IN_CART_UPDATED event. Running fireworksTotalUpdatedListener...');

    this.refresh();
  }

  /**
   * This separate listener is required due to the client-side implementation of the Bonus Rewards
   * system. It would not be required if the Bonus Rewards were implemented server side, where they
   * should be. Listening for the end of the latest CartWatcher UPDATE handles the following scenario:
   * 1) User has Level 1 in cart.
   * 2) User adds a fireworks product to cart, triggering what should be the addition of Level 2.
   * 3) User quickly removes the same fireworks product from cart, returning the cart total to Level 1.
   *
   * In the above scenario, the temporary change to Level 2 can result in the Level 2 product being
   * added but the fireworks total appears to have remained unchanged (because it returns to the
   * Level 1 value). This desynchronization happens because CartWatcher buffers refresh requests,
   * so the client can fall out of sync with the server if updates happen often enough.
   *
   * The cartWatcherUpdatedListener() function acts as a last resort, in that it always checks the
   * most recent state of the cart reported by CartWatcher, so if the rewards products in the cart
   * do not match the expected reward, the mismatch will be caught and corrected. This workaround
   * causes a high number of HTTP requests, resulting in jittery behaviour in the UI when rewards
   * are added or removed due to rapid use of the Quantity button. Better implementations would be:
   *
   * 1) Upgrade to Shopify Plus and use Shopify Scripts to implement Bonus Rewards server side.
   * 2) Rewrite the cart's quantity selector to integrate it into the Bonus Rewards system, with
   *    a loading state that disables the UI until the rewards have been syncronized.
   */
  cartWatcherUpdatedListener () {
    console.log('* BonusRewards caught CartWatcher UPDATE event. Running cartWatcherUpdatedListener...');

    this.refresh();
  }

  handleActiveBonusRewardChange () {
    console.log('* Checking for existing "update rewards in cart" task...');
    if (this.updateBonusRewardInProgress) {
      console.log('* Found existing UpdateBonusRewardsInCartTask in progress. Will check bonus reward state again when task completes.');
      this.updateBonusRewardCheckBuffered = true;
      return;
    }

    console.log('* No UpdateBonusRewardsInCartTask in progress. Creating new UpdateBonusRewardsInCartTask...');
    this.updateBonusRewardInProgress = true;
    this.updateBonusRewardsInCart(this.activeBonusReward);
  }

  updateBonusRewardsInCart (activeBonusReward) {
    this.updateBonusRewardsInCartTask = new UpdateBonusRewardsInCartTask(activeBonusReward);
    this.updateBonusRewardsInCartTask.on(COMPLETE, () => {
      console.log('>>> Finished "update rewards in cart" task.');
      this.doPostUpdateActions();
    });

    this.updateBonusRewardsInCartTask.on(FAIL, () => {
      console.log('>>> Failed "update rewards in cart" task.');
      this.doPostUpdateActions();
    });

    console.log('* Starting "update rewards in cart" task...');
    this.updateBonusRewardsInCartTask.start();
  }

  doPostUpdateActions () {
    this.dispatchEvent(BONUS_REWARD_UPDATED);
    this.updateBonusRewardInProgress = false;
    let noRemainingUpdates = false;

    if (this.updateBonusRewardCheckBuffered) {
      console.log('>>> Processing buffered rewards check... ');
      this.updateBonusRewardCheckBuffered = false;
      if (this.getActiveBonusRewardHasChanged()) {
        console.log('>>> Buffered rewards check result: reward has changed.');
        this.handleActiveBonusRewardChange();
      } else {
        console.log('>>> Buffered rewards check result: reward has NOT changed. Update task not required.');
        noRemainingUpdates = true;
      }
    } else {
      noRemainingUpdates = true;
    }

    if (noRemainingUpdates) {
      // Now that all bonus rewards updates have been processed, call getCart() so the
      // theme's JavaScript-based cart presentation layer updates to reflect the new cart contents.
      // Without this code, on screen, the user would see the old contents of the cart.
      console.log('* Retrieving cart from /cart.js...');
      Shopify.getCart(Shopify.updateQuickCart);
    }
  }

  //================================================================================================
  // REWARDS UTILITIES
  //================================================================================================

  getActiveBonusReward () {
    let activeBonusReward = null;
    let fireworksTotalInCart = RocketTheme.globals.dataStore.fireworksTotalInCart;
    BonusRewards.levels.forEach(bonus => {
      if (fireworksTotalInCart > bonus.level) {
        activeBonusReward = bonus;
      }
    });
    return activeBonusReward;
  }

  getCurrentBonusRewardsInCart() {
    let currentBonusRewards = [];
    RocketTheme.globals.dataStore.productsInCart.forEach(product => {
      BonusRewards.levels.forEach(bonus => {
        if (ProductService.getVariantID(product) === bonus.id) {
          currentBonusRewards.push(bonus);
        }
      });
    });
    return currentBonusRewards;
  }

  getActiveBonusRewardHasChanged () {
    let rewardChanged = false;
    let expectedBonusReward = this.getActiveBonusReward();
    let actualBonusRewards = this.getCurrentBonusRewardsInCart();

    console.log('* Expected bonus reward: ', expectedBonusReward);
    console.log('* Actual bonus rewards: ', actualBonusRewards);
    console.log('* Products in datastore: ', RocketTheme.globals.dataStore.productsInCart);

    if (actualBonusRewards.length > 1) {
      console.warn('* MULTIPLE BONUS REWARDS FOUND IN CART');
      rewardChanged = true;
    } else if (actualBonusRewards.length === 1) {
      if (actualBonusRewards[0] !== expectedBonusReward) {
        console.log('* Existing bonus reward changed');
        rewardChanged = true;
      } else {
        console.log('* Bonus reward has not changed');
      }
    } else if (notNil(expectedBonusReward)) {
      console.log('* Bonus reward changed (from no prior reward)');
      rewardChanged = true;
    }
    return rewardChanged;
  }

  getNextBonusReward () {
    let nextBonusReward;
    this.nextBonusReward = BonusRewards.levels[0];
    let nextBonusRewardIndex = 1;

    if (!isEmpty(this.activeBonusReward)) {
      nextBonusRewardIndex = this.activeBonusReward.index + 1;
    }
    BonusRewards.levels.forEach(bonus => {
      if (bonus.index === nextBonusRewardIndex) {
        nextBonusReward = bonus;
      }
    });
    return nextBonusReward;
  }

  getRemainingUntilNextLevel () {
    let fireworksTotalInCart = RocketTheme.globals.dataStore.fireworksTotalInCart;

    if (isNil(this.nextBonusReward)) {
      return 0;
    } else {
      return this.nextBonusReward.level - fireworksTotalInCart;
    }
  }

  getProgressPercentage () {
    let fireworksTotalInCart = RocketTheme.globals.dataStore.fireworksTotalInCart;
    
    if (isNil(this.nextBonusReward)) {
      return 0;
    } 

    if (isNil(this.activeBonusReward)) {
      return Math.floor(fireworksTotalInCart / this.nextBonusReward.level * 100);
    }
    return Math.floor((fireworksTotalInCart - this.activeBonusReward.level) / (this.nextBonusReward.level - this.activeBonusReward.level) * 100);
  }
}

//==================================================================================================
// BONUS REWARDS CONSTANTS
//==================================================================================================

BonusRewards.levels = [
  new BonusReward(15000, 39310116454589, 1),
  new BonusReward(20000, 39310858420413, 2),
  new BonusReward(30000, 39310870708413, 3),
  new BonusReward(40000, 39310873297085, 4),
  new BonusReward(50000, 39310876115133, 5),
  new BonusReward(60000, 39310879195325, 6),
  new BonusReward(75000, 39310912815293, 7),
  new BonusReward(100000, 39310917664957, 8),
  new BonusReward(125000, 39310919336125, 9),
  new BonusReward(150000, 39310922252477, 10)
];

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

class DataStore {
  constructor () {
    this.cart = null;
    this.productsInCart = [];
    this.fireworksTotalInCart = -1;
    this.totalInCart = -1;
  }
}

class BonusRewardsProgressView {
  constructor (bonusRewards) {
    this.bonusRewards = bonusRewards;
    this.bonusRewards.on(BONUS_REWARD_UPDATED, this.bonusRewardUpdatedListener.bind(this));
  }

  //================================================================================================
  // DEPENDENCIEES
  //================================================================================================
  setCartWatcher (cartWatcher) {
    this.cartWatcher = cartWatcher;
    this.cartWatcher.on(FIREWORKS_TOTAL_IN_CART_UPDATED$1, this.fireworksTotalInCartUpdatedListener.bind(this));
    this.refresh();
  }

  //================================================================================================
  // LISTENERS
  //================================================================================================

  fireworksTotalInCartUpdatedListener () {
    this.updateProgressBar();
  }

  bonusRewardUpdatedListener () {
    this.showActiveBonusContainer();
  }

  //================================================================================================
  // RENDERING
  //================================================================================================

  refresh () {
    this.showActiveBonusContainer();
    this.updateProgressBar();
  }

  showActiveBonusContainer () {
    let activeBonusRewardIndex = 1;
    if (notNil(this.bonusRewards.activeBonusReward)) {
      activeBonusRewardIndex = this.bonusRewards.activeBonusReward.index;
    }
    if (notNil(document.querySelector('.template-cart'))) {
      let bonusContainers = document.querySelectorAll('.bonusRewards-container .bonus-tiered-container');
      bonusContainers.forEach(bonusContainer => {
        if (!bonusContainer.classList.contains('hidden')) {
          bonusContainer.classList.add('hidden');
        }
      });
      document.querySelector('.bonusRewards-container .level-' + activeBonusRewardIndex).classList.remove('hidden');
    }

    this.fadeInBonusContainer();
  }

  fadeInBonusContainer () {
    if (notNil(document.querySelector('.template-cart'))) {
      document.querySelector('.bonusRewards-container').style.opacity = 1;
    } else {
      document.querySelector('.promo-bar .promo-bar-container').style.opacity = 1;
    }
  }

  updateProgressBar () {
    // Show/Hide progress bar
    if (RocketTheme.globals.dataStore.fireworksTotalInCart === 0) {
      document.querySelector('.bonusRewards-progress').classList.add('hidden');
    } else {
      document.querySelector('.bonusRewards-progress').classList.remove('hidden');
    }
    document.querySelector(".bonusRewards-bar").style.width = this.bonusRewards.progressPercentage + '%';

    // Bonus Rewards message
    if (notNil(this.bonusRewards.nextBonusReward)) {
      let remainingUntilNextLevel = Shopify.formatMoney(this.bonusRewards.remainingUntilNextLevel);
      let nextLevelIndex = this.bonusRewards.nextBonusReward.index;
  
      document.querySelector('.bonusRewards-message').innerHTML = 
      `<b>${remainingUntilNextLevel}</b> away from <b>Bonus Rewards Level ${nextLevelIndex}</b>! <i class="fas fa-gift"></i>`;
    } else {
      document.querySelector('.bonusRewards-progress').classList.add('hidden');
      document.querySelector('.bonusRewards-message').innerHTML = 
      `You've earned the <b>highest Bonus Rewards</b>! <i class="fas fa-gift"></i>`;
    }
  }
}

class WaitForShopifySDKTask extends Task {
  constructor () {
    super();
    this.name = "WAIT FOR SHOPIFY SDK";
  }

  start () {
    super.start();

    this.checkShopifySDK();

    if (!this.complete) {
      this.checkShopifySDKIntervalID = setInterval(() => {
        this.checkShopifySDK();
        if (this.complete) {
          clearInterval(this.checkShopifySDKIntervalID);
        }
      }, 200);
    }
  }

  checkShopifySDK () {
    if (notNil(Shopify)) {
      if (notNil(Shopify.onCartUpdate)) {
        this.done();
      }
    }
  }
}

class SellyService {
}

SellyService.data = {};

SellyService.getFinalUnitPrice = function (productID, quantity, originalPrice) {
  let activeOffers = SellyService.getActiveOffersForProduct(productID);
  let finalUnitPrice = originalPrice;

  activeOffers.forEach(offer => {
    if (offer.offerType === SellyService.OFFER_TYPE_BULK) {
      let discount = SellyService.getActiveDiscountForQuantity(offer.offerObj, quantity);
      if (notNil(discount)){
        switch (discount.type_id) {
          case SellyService.DISCOUNT_TYPE_PERCENT:
            finalUnitPrice = originalPrice - (originalPrice * (discount.value/100));
            break;
  
          case SellyService.DISCOUNT_TYPE_FIXED_AMOUNT_DISCOUNT:
          case SellyService.DISCOUNT_TYPE_FIXED_PRICE:
            finalUnitPrice = originalPrice - discount.value;
            break;
        }
      }
    }
  });

  return finalUnitPrice;
};

SellyService.getActiveOffersForProduct = function (productID) {
  let activeOffers = [];
  if (notNil(SellyService.data)) {
    Object.keys(SellyService.data.offers).forEach(offerType => {
      for (const [offerID, offerObj] of Object.entries(SellyService.data.offers[offerType])) {
        if (offerObj.product_groups[0].ids.includes(productID)) {
          activeOffers.push({
            offerType: offerType,
            offerObj: offerObj
          });
        }
      }
    });
  }

  return activeOffers;
};

SellyService.getActiveDiscountForQuantity = function (offer, quantity) {
  let discount = null;
  offer.discount.value.levels.forEach(level => {
    if (quantity >= level.quantity) {
      discount = level.discount;
    }
  });

  return discount;
};

SellyService.getProduct = function (productID) {
  if (notNil(SellyService.data)) {
    return SellyService.data.products[productID];
  }
};

SellyService.getMotivationalMessage = function (activeOffer) {
  return activeOffer.offerObj.mtv_message;
};

SellyService.OFFER_TYPE_BULK = '7';
SellyService.DISCOUNT_TYPE_PERCENT = 1;
SellyService.DISCOUNT_TYPE_FIXED_AMOUNT_DISCOUNT = 2;
SellyService.DISCOUNT_TYPE_FIXED_PRICE = 3;

class WaitForSellyTask extends Task {
  constructor () {
    super();
    this.name = "WAIT FOR SELLY";
  }

  start () {
    super.start();

    this.checkSelly();

    if (!this.complete) {
      this.checkSellyIntervalID = setInterval(() => {
        this.checkSelly();
        if (this.complete) {
          clearInterval(this.checkSellyIntervalID);
        }
      }, 200);
    }
  }

  checkSelly () {
    if (notNil(window.sellyData)) {
      SellyService.data = window.sellyData;
      this.done();
    }
  }
}

class ShopifySDKAdapter extends EventDispatcher {
  constructor () {
    super();
    this.applyAdapter();
  }

  applyAdapter () {
    let originalShopifyOnCartUpdate = Shopify.onCartUpdate;
    Shopify.onCartUpdate = (cart, form) => {
      originalShopifyOnCartUpdate(cart, form);
      this.handleCartUpdate();
    };
  }

  handleCartUpdate () {
    this.dispatchEvent(SHOPIFY_CART_UPDATE$1);
  }
}

class InitShopifySDKAdapter extends Task {
  constructor () {
    super();
    this.name = 'INIT SHOPIFY SDK ADAPTER';
  }

  start () {
    super.start();
    RocketTheme.globals.shopifySDKAdapter = new ShopifySDKAdapter();
    this.done();
  }
}

class UpdateCartInDataStoreTask extends Task {

  constructor () {
    super();
    this.name = "UpdateCartInDataStore";
  }

  start () {
    super.start();
    
    let getCartTask = ShopifyCart.getCartTask();
    console.log('* Retrieving cart from server');
    getCartTask.on(COMPLETE, () => {
      RocketTheme.globals.dataStore.cart = getCartTask.json;
      console.log('* Received cart from server');
      this.done();
    });
    getCartTask.start();
  }
}

class UpdateCartProductsInDataStoreTask extends TaskManager {
  
  constructor () {
    super('GET ALL PRODUCTS IN CART');

    // DEBUGGING CODE:
    // If productsInCart and the cart.items ever have different lengths, something has gone wrong,
    // and the cause should be investigated.
    this.on(COMPLETE, () => {
      if (RocketTheme.globals.dataStore.productsInCart.length
        !== RocketTheme.globals.dataStore.cart.items.length) {
        console.warn('cart.items and productsInCart MISMATCH');
        console.log('datastore.cart.items: ', RocketTheme.globals.dataStore.cart.items);
        console.log('datastore.productsInCart: ', RocketTheme.globals.dataStore.productsInCart);
      }
    });
  }

  initTasks () {
    this.tasks = [];
    let cart = RocketTheme.globals.dataStore.cart;
    let newTasks = [];

    cart.items.forEach(item => {
      let getProductTask = ShopifyCart.getProductTask(item.url + '.js');
      getProductTask.on(COMPLETE, () => {
        RocketTheme.globals.dataStore.productsInCart.push(getProductTask.json);
      });
      newTasks.push(getProductTask);
    });
    this.addTasks(newTasks);
  }

  start() {
    console.log('* Retrieving products from server');
    this.clearProductsInCart();
    this.initTasks();
    super.start();
  }

  clearProductsInCart () {
    RocketTheme.globals.dataStore.productsInCart = [];
  }
}

class UpdateFireworksTotalInDataStoreTask extends Task {
  
  constructor () {
    super();

    this.name = 'GET FIREWORKS IN CART TOTAL';
  }

  start() {
    super.start();

    console.log('* Calculating fireworks total');
    console.log('datastore.cart.items: ', RocketTheme.globals.dataStore.cart.items);
    console.log('datastore.productsInCart: ', RocketTheme.globals.dataStore.productsInCart);

    let fireworksProducts = [];
    
    RocketTheme.globals.dataStore.cart.items.forEach(item => {
      if (ProductService.isFireworkProduct(item.handle)) {
        fireworksProducts.push({
          handle: item.handle,
          product_id: item.product_id,
          unitFinalPrice: SellyService.getFinalUnitPrice(item.product_id, item.quantity, item.price),
          lineItemTotalFinalPrice: item.quantity * SellyService.getFinalUnitPrice(item.product_id, item.quantity, item.price)
        });
      }
    });

    console.log('=================');
    console.log(fireworksProducts);

    RocketTheme.globals.dataStore.fireworksTotalInCart = sumBy(fireworksProducts, 'lineItemTotalFinalPrice');
    console.log('* Fireworks total: ' + RocketTheme.globals.dataStore.fireworksTotalInCart);
    this.done();
  }
}

class LocalCartRefresher extends TaskManager {
  constructor () {
    super('LOCAL CART REFRESHER');
    this.init();
  }

  init () {
    let tasks = [
      new UpdateCartInDataStoreTask(),
      new UpdateCartProductsInDataStoreTask(),
      new UpdateFireworksTotalInDataStoreTask()
    ];

    this.addTasks(tasks);
  }
}

/**
 * Listens for updates to the cart reported by the Shopify SDK, and updates the RocketTheme
 * DataStore's local state in response.
 */
class CartWatcher extends EventDispatcher {

  constructor (shopifySDKAdapter) {
    super();
    this.refreshInProgress = false;
    this.shopifySDKAdapter = shopifySDKAdapter;
    this.shopifySDKAdapter.on(SHOPIFY_CART_UPDATE, this.shopifyCartUpdateListener.bind(this));
  }

  /**
   * Handles updates to the cart reported by the Shopify SDK (i.e., Shopify.onCartUpdate()).
   * When the Shopify SDK reports a change in the cart, refresh the local cart (i.e., the DataStore).
   * retrieve the cart from the server,
   * then retrieve all products from the server, then update the total price of fireworks
   * in cart.
   */
  shopifyCartUpdateListener () {
    console.log('CartWatcher detected cart change (from Shopify SDK\'s Shopify.onCartUpdate())');
    this.refresh();
  }

  /**
   * Handles updates to the cart reported by the Shopify SDK (i.e., Shopify.onCartUpdate()).
   * When the Shopify SDK reports a change in the cart, refresh the local cart (i.e., the DataStore).
   * retrieve the cart from the server,
   * then retrieve all products from the server, then update the total price of fireworks
   * in cart.
   */
  refresh () {
    if (this.refreshInProgress) {
      console.error('############################################################################');
      console.error('############################################################################');
      console.error('############################################################################');
      console.error('##########################  REFRESH ALREADY IN PROGRESS ####################');
      console.error('############################################################################');
      console.error('############################################################################');
      console.error('############################################################################');
      console.error('================ BUFFERING REFRESH REQUEST... =============');
      // A refresh is already in progress, so a new refresh can't be executed yet. Wait for the
      // current refresh to complete, then execute the requested refresh. (Executing more than one
      // refresh at a time would cause the cart's local state to become scrambled, with the
      // potential for dataStore.fireworksTotalInCart to contain a different set of products than
      // those in dataStore.productsInCart.
      this.refreshBuffered = true;
      return;
    }
    this.refreshInProgress = true;

    let previousFireworksTotal = RocketTheme.globals.dataStore.fireworksTotalInCart;

    // Execute tasks
    this.updateCartTaskManager = new LocalCartRefresher();
    this.updateCartTaskManager.on(COMPLETE, e => {
      this.refreshInProgress = false;
      log('Update Cart Manager finished updating the cart.');
      log('Current Fireworks total in cart: ' + RocketTheme.globals.dataStore.fireworksTotalInCart);
      if (previousFireworksTotal !== RocketTheme.globals.dataStore.fireworksTotalInCart) {
        this.dispatchEvent(FIREWORKS_TOTAL_IN_CART_UPDATED);
      } else {
        console.log('Fireworks total in cart has not changed.');
      }
      this.dispatchEvent(UPDATE);
      if (this.refreshBuffered) {
        console.error('================ EXECUTING BUFFERED REFRESH NOW... =============');
        // A refresh was requested while the current refresh was already in progress. Now that the
        // current refresh has been allowed to complete, execute the refresh that was previously
        // requested.
        this.refreshBuffered = false;
        this.refresh();
      }
    });
    this.updateCartTaskManager.on(FAIL, e => {
      this.refreshInProgress = false;
      log('Update Cart Manager failed to update cart.');
    });

    this.updateCartTaskManager.start();
  }

}

class InitCartWatcherTask extends Task {
  constructor () {
    super();
    this.name = 'INIT CART WATCHER';
  }

  start () {
    super.start();
    RocketTheme.globals.cartWatcher = new CartWatcher(RocketTheme.globals.shopifySDKAdapter);

    this.boundUpdateListener = this.cartWatcherUpdateListener.bind(this);
    RocketTheme.globals.cartWatcher.on(UPDATE, this.boundUpdateListener);
    RocketTheme.globals.cartWatcher.refresh();
  }

  cartWatcherUpdateListener () {
    // CartWatcher has been created and finished its first refresh, so the init task is done
    RocketTheme.globals.cartWatcher.off(UPDATE, this.boundUpdateListener);
    this.done();
  }
}

class CartTotalManager extends EventDispatcher {
  constructor (datastore) {
    super();
    this.datastore = datastore;

    RocketTheme.globals.cartWatcher.on(UPDATE$1, this.cartUpdateListener.bind(this));
    this.setCartTotalInDataStore();
  }

  cartUpdateListener () {
    console.log('%%CART TOTAL MANAGER RECEIVE UPDATE');
    this.setCartTotalInDataStore();
  }

  setCartTotalInDataStore () {
    console.log('%%', RocketTheme.globals.dataStore.productsInCart);
    let products = [];

    RocketTheme.globals.dataStore.cart.items.forEach(item => {
      products.push({
        handle: item.handle,
        product_id: item.product_id,
        unitFinalPrice: SellyService.getFinalUnitPrice(item.product_id, item.quantity, item.price),
        lineItemTotalFinalPrice: item.quantity * SellyService.getFinalUnitPrice(item.product_id, item.quantity, item.price)
      });
    });

    RocketTheme.globals.dataStore.totalInCart = sumBy(products, 'lineItemTotalFinalPrice');
    console.log('%%Local cart total: ' + RocketTheme.globals.dataStore.totalInCart);
    this.dispatchEvent(UPDATE$1);
  }
}

class QuickCartSubtotalVerifier {
  constructor (cartTotalManager) {
    this.cartTotalManager = cartTotalManager;
    this.cartTotalManager.on(UPDATE$1, this.cartTotalUpdateListener.bind(this));
  }

  cartTotalUpdateListener () {
    setTimeout(() => {
      let renderedPrice;
      let normalPriceSpan = document.querySelector('.tdf_price_normal .tdf_money.money');
      let floorLocalCartTotal = Math.floor(RocketTheme.globals.dataStore.totalInCart);
      if (notNil(normalPriceSpan)) {
        renderedPrice = parseFloat(normalPriceSpan.textContent.substr(1)) * 100;
        console.log('%% Rendered price: ', renderedPrice);
        console.log('%% Floor cart total: ', floorLocalCartTotal);
      }
      console.log('%% Normal price span: ', normalPriceSpan);
  
      if (Math.abs(floorLocalCartTotal - renderedPrice) > 1) {
        console.log('%%%Subtotal are different!!!');
        
      } else {
        console.log('%%Subtotal check okay');
      }
    }, 2000);
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

    RocketTheme.globals.dataStore = new DataStore;
    RocketTheme.globals.cartWatcher = null;
    RocketTheme.globals.shopifySDKAdapter = null;

    // Create Bonus Rewards manager
    this.bonusRewards = new BonusRewards();
    this.bonusRewardsProgressView = new BonusRewardsProgressView(this.bonusRewards);

    RocketTheme.globals.releaseInfo = new ReleaseInfo('Rocket Dev Theme', '1.0.0', 'Thu Jun 10 2021 15:58:08 GMT-0400 (Eastern Daylight Time)');

    log(`RocketTheme ${RocketTheme.globals.releaseInfo.title} ${RocketTheme.globals.releaseInfo.version} boot complete.`);
    log(`Last compiled: ${RocketTheme.globals.releaseInfo.date}`);

    let bootManager = RocketTheme.globals.bootManager = new TaskManager('Boot');
    let bootTasks = [new WaitForShopifySDKTask,
      new WaitForSellyTask(),
      new InitShopifySDKAdapter(),
      new InitCartWatcherTask()
    ];
    bootManager.addTasks(bootTasks);
    bootManager.on(COMPLETE, () => {
      console.log('######################### BOOT DONE');
      this.bonusRewards.setCartWatcher(RocketTheme.globals.cartWatcher);
      this.bonusRewards.refresh();
      this.bonusRewardsProgressView.setCartWatcher(RocketTheme.globals.cartWatcher);

      this.cartTotalManager = new CartTotalManager(RocketTheme.globals.dataStore);
      this.quickCartSubtotalVerifier = new QuickCartSubtotalVerifier(this.cartTotalManager);
    });
    bootManager.start();
  }

}

RocketTheme.globals = {};

// Main JavaScript entry point.
// Starts the application by instantiating the main application class...
const rocketTheme = new RocketTheme();
rocketTheme.boot();

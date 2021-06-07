import {UpdateCartInDataStoreTask} from './UpdateCartInDataStoreTask.js';
import {UpdateCartProductsInDataStoreTask} from './UpdateCartProductsInDataStoreTask.js';
import {UpdateFireworksTotalInDataStoreTask} from './UpdateFireworksTotalInDataStoreTask.js';
import {TaskManager} from '../utils/TaskManager.js';

export class LocalCartRefresher extends TaskManager {
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

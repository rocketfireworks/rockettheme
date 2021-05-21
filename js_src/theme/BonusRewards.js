import {log} from '../utils/logfunctions.js';
import {COMPLETE, FAIL} from '../utils/constants.js';
import {TaskManager} from '../utils/TaskManager.js';
import { RocketTheme } from './RocketTheme.js';
import { GetFireworksInCartTotalTask } from './GetFireworksTotalInCartTask.js';
import { UpdateCartProductsInDataStoreTask } from './UpdateCartProductsInDataStoreTask.js';
import { WaitForSellyTask } from './WaitForSellyTask.js';
import { UpdateCartInDataStoreTask } from './UpdateCartInDataStoreTask.js';
import { BonusReward } from './BonusReward.js';
import { EventDispatcher } from '../utils/EventDispatcher.js';
import { FIREWORKS_TOTAL_IN_CART_UPDATED } from './Events.js';

export class BonusRewards extends EventDispatcher {
  constructor () {
    super();

    log('BonusRewards 4.0 manager ready.')

    this.updateRewards();
  }

  updateRewards () {
    // Create list of tasks
    let tasks = [
      new UpdateCartInDataStoreTask(),
      new UpdateCartProductsInDataStoreTask(),
      new WaitForSellyTask(),
      new GetFireworksInCartTotalTask()
    ];

    // Execute tasks
    this.rewardsManager = new TaskManager('Rewards Manager');
    this.rewardsManager.addTasks(tasks);
    this.rewardsManager.on(COMPLETE, e => {
      log('RewardsManager finished updating rewards.');
      log('Current Fireworks total in cart: ');
      log(RocketTheme.globals.dataStore.fireworksTotalInCart);
      this.dispatchEvent(FIREWORKS_TOTAL_IN_CART_UPDATED);
    });
    this.rewardsManager.on(FAIL, e => {
      log('RewardsManager failed to update rewards.');
    });

    this.rewardsManager.start();
  }
}

BonusRewards.levels = [
  new BonusReward(150, 39310116454589, 1),
  new BonusReward(200, 39310858420413, 2),
  new BonusReward(300, 39310870708413, 3),
  new BonusReward(400, 39310873297085, 4),
  new BonusReward(500, 39310876115133, 5),
  new BonusReward(600, 39310879195325, 6),
  new BonusReward(750, 39310912815293, 7),
  new BonusReward(1000, 39310917664957, 8),
  new BonusReward(1250, 39310919336125, 9),
  new BonusReward(1500, 39310922252477, 10)
]
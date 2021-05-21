import {log} from '../utils/logfunctions.js';
import {notNil} from '../utils/utils.js';
import {COMPLETE, FAIL} from '../utils/constants.js';
import {TaskManager} from '../utils/TaskManager.js';
import {ShopifyCart} from '../shopify/ShopifyCart.js';
import { RocketTheme } from './RocketTheme.js';
import { GetFireworksInCartTotalTask } from './GetFireworksTotalInCartTask.js';
import { GetAllProductsInCartTask } from './GetAllProductsInCartTask.js';
import { WaitForSellyTask } from './WaitForSellyTask.js';

export class BonusRewards {
  constructor () {
    log('BonusRewards 4.0 manager ready.')

    this.updateRewards();
  }

  updateRewards () {
    // Get Cart
    let getCartTask = ShopifyCart.getCartTask();
    getCartTask.on(COMPLETE, () => {
      RocketTheme.globals.dataStore.cart = getCartTask.json;
    })

    // Create list of tasks
    let tasks = [
      getCartTask,
      new WaitForSellyTask,
      new GetAllProductsInCartTask(),
      new GetFireworksInCartTotalTask()
    ];

    // Execute tasks
    this.rewardsManager = new TaskManager('Rewards Manager');
    this.rewardsManager.addTasks(tasks);
    this.rewardsManager.on(COMPLETE, e => {
      log('RewardsManager finished updating rewards.');
      log('Current Fireworks total in cart: ');
      log(RocketTheme.globals.dataStore.fireworksTotalInCart);
    });
    this.rewardsManager.on(FAIL, e => {
      log('RewardsManager failed to update rewards.');
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

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

      this.updateActiveBonusReward();
      this.updateNextBonusReward();
      this.calculateRemainingUntilNextLevel();
      this.calculateProgressBar();
      this.dispatchEvent(FIREWORKS_TOTAL_IN_CART_UPDATED);
    });
    this.rewardsManager.on(FAIL, e => {
      log('RewardsManager failed to update rewards.');
    });

    this.rewardsManager.start();
  }

  updateActiveBonusReward () {
    let fireworksTotalInCart = RocketTheme.globals.dataStore.fireworksTotalInCart;
    BonusRewards.levels.forEach(bonus => {
      if (fireworksTotalInCart > bonus.level) {
        BonusRewards.activeBonusReward = bonus;
      }
    });
  }

  updateNextBonusReward () {
    BonusRewards.nextBonusReward = BonusRewards.levels[0];
    let nextBonusRewardIndex = 1;

    if (Object.keys(BonusRewards.activeBonusReward).length !== 0) {
      nextBonusRewardIndex = BonusRewards.activeBonusReward.index + 1;
    }
    BonusRewards.levels.forEach(bonus => {
      if (bonus.index === nextBonusRewardIndex) {
        BonusRewards.nextBonusReward = bonus;
      }
    });
  }

  calculateRemainingUntilNextLevel () {
    let fireworksTotalInCart = RocketTheme.globals.dataStore.fireworksTotalInCart;

    return BonusRewards.remainingUntilNextLevel = BonusRewards.nextBonusReward.level - fireworksTotalInCart;
  }

  calculateProgressBar () {
    return BonusRewards.progress = Math.floor((RocketTheme.globals.dataStore.fireworksTotalInCart * 100) / BonusRewards.nextBonusReward.level);
  }
}

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
]

BonusRewards.activeBonusReward = {};
BonusRewards.nextBonusReward = {};

BonusRewards.remainingUntilNextLevel = 0;
BonusRewards.progress = 0;
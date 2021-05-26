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
import { ACTIVE_BONUS_REWARD_CHANGED, BONUS_REWARD_UPDATED, FIREWORKS_TOTAL_IN_CART_UPDATED } from './Events.js';
import { ShopifyCart } from '../shopify/ShopifyCart.js';
import { UpdateBonusRewardsInCartTask } from './UpdateBonusRewardsInCartTask.js';
import { isNil, notNil } from '../utils/utils.js';

export class BonusRewards extends EventDispatcher {
  constructor () {
    super();

    log('BonusRewards 4.0 manager ready.')
    
    this.activeBonusReward = null;
    this.nextBonusReward = null;
    this.newBonusReward = null;

    this.remainingUntilNextLevel = 0;
    this.progressPercentage = 0;

    this.updateBonusRewardsInCartTask = null;

    this.waitForUpdateIntervalId = -1;

    this.updateCartData();

    this.on(FIREWORKS_TOTAL_IN_CART_UPDATED, this.fireworksTotalUpdatedListener.bind(this));
    this.on(ACTIVE_BONUS_REWARD_CHANGED, this.activeBonusRewardChangedListener.bind(this));
  }

  updateCartData () {
    let previousFireworksTotal = RocketTheme.globals.dataStore.fireworksTotalInCart;

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
      if (previousFireworksTotal !== RocketTheme.globals.dataStore.fireworksTotalInCart) {
        this.dispatchEvent(FIREWORKS_TOTAL_IN_CART_UPDATED);
      }
    });
    this.rewardsManager.on(FAIL, e => {
      log('RewardsManager failed to update rewards.');
    });

    this.rewardsManager.start();
  }

  fireworksTotalUpdatedListener () {
    let previousActiveBonusReward = this.activeBonusReward;

    this.activeBonusReward = this.getActiveBonusReward();
    this.nextBonusReward = this.getNextBonusReward();
    this.remainingUntilNextLevel = this.getRemainingUntilNextLevel();
    this.progressPercentage = this.getProgressPercentage();

    if (previousActiveBonusReward !== this.activeBonusReward) {
      this.dispatchEvent(ACTIVE_BONUS_REWARD_CHANGED);
    }
  }

  activeBonusRewardChangedListener () {
    this.newBonusReward = this.activeBonusReward;
    if (isNil(this.updateBonusRewardsInCartTask)) {
      this.updateBonusRewardsInCart(this.newBonusReward);
    } else {
      if (this.waitForUpdateIntervalId === -1) {
        this.waitForUpdateIntervalId = setInterval(() => {
          if (isNil(this.updateBonusRewardsInCartTask)) {
            clearInterval(this.waitForUpdateIntervalId);
            this.waitForUpdateIntervalId = -1;
            this.updateBonusRewardsInCart(this.newBonusReward);
          }
        }, 500);
      }
    }
  }

  updateBonusRewardsInCart (activeBonusReward) {
    this.updateBonusRewardsInCartTask = new UpdateBonusRewardsInCartTask(activeBonusReward);
    this.updateBonusRewardsInCartTask.on(COMPLETE, () => {
      this.updateBonusRewardsInCartTask = null;
      this.dispatchEvent(BONUS_REWARD_UPDATED);
    });
    this.updateBonusRewardsInCartTask.start();
  }

  getActiveBonusReward () {
    let activeBonusReward;
    let fireworksTotalInCart = RocketTheme.globals.dataStore.fireworksTotalInCart;
    BonusRewards.levels.forEach(bonus => {
      if (fireworksTotalInCart > bonus.level) {
        activeBonusReward = bonus;
      }
    });
    return activeBonusReward;
  }

  getNextBonusReward () {
    let nextBonusReward;
    this.nextBonusReward = BonusRewards.levels[0];
    let nextBonusRewardIndex = 1;

    if (Object.keys(this.activeBonusReward).length !== 0) {
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

    return this.nextBonusReward.level - fireworksTotalInCart;
  }

  getProgressPercentage () {
    return Math.floor((RocketTheme.globals.dataStore.fireworksTotalInCart * 100) / this.nextBonusReward.level);
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

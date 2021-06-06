import {COMPLETE, FAIL} from '../utils/constants.js';
import { RocketTheme } from './RocketTheme.js';
import { BonusReward } from './BonusReward.js';
import { EventDispatcher } from '../utils/EventDispatcher.js';
import { ACTIVE_BONUS_REWARD_CHANGED, BONUS_REWARD_UPDATED, FIREWORKS_TOTAL_IN_CART_UPDATED } from './Events.js';
import { UpdateBonusRewardsInCartTask } from './UpdateBonusRewardsInCartTask.js';
import { isEmpty, isNil, notNil } from '../utils/utils.js';
import { ProductService } from './ProductService.js';

export class BonusRewards extends EventDispatcher {
  constructor () {
    super();
    this.activeBonusReward = null;
    this.nextBonusReward = null;

    this.remainingUntilNextLevel = 0;
    this.progressPercentage = 0;

    this.updateBonusRewardsInCartTask = null;

    this.waitForUpdateIntervalId = -1;

    this.on(ACTIVE_BONUS_REWARD_CHANGED, this.activeBonusRewardChangedListener.bind(this));
  }

  //================================================================================================
  // DEPENDENCIEES
  //================================================================================================

  setCartWatcher (cartWatcher) {
    this.cartWatcher = cartWatcher;
    this.cartWatcher.on(FIREWORKS_TOTAL_IN_CART_UPDATED, this.fireworksTotalUpdatedListener.bind(this));
  }

  //================================================================================================
  // BONUS REWARDS MANAGEMENT
  //================================================================================================

  refresh () {
    console.log("REFRESHING")
    let expectedBonusReward = this.getActiveBonusReward();
    let actualBonusRewards = this.getCurrentBonusRewardsInCart();

    this.activeBonusReward = expectedBonusReward;
    this.nextBonusReward = this.getNextBonusReward();
    this.remainingUntilNextLevel = this.getRemainingUntilNextLevel();
    this.progressPercentage = this.getProgressPercentage();

    console.log('* Expected bonus reward: ', expectedBonusReward);
    console.log('* Actual bonus reward: ', actualBonusRewards);

    let rewardChanged = false;
    if (actualBonusRewards.length > 1) {
      console.warn('* MULTIPLE BONUS REWARDS FOUND IN CART');
      rewardChanged = true;
    } else if (actualBonusRewards.length === 1
      && actualBonusRewards[1] !== expectedBonusReward) {
      console.log('* Existing bonus reward changed');
      rewardChanged = true;
    } else if (notNil(expectedBonusReward)) {
      console.log('* Bonus reward changed (from no prior reward)');
      rewardChanged = true;
    }

    if (rewardChanged) {
      this.activeBonusReward = expectedBonusReward;
      this.dispatchEvent(ACTIVE_BONUS_REWARD_CHANGED);
    }
  }

  fireworksTotalUpdatedListener () {
    console.log('* Fireworks Total changed. Running fireworksTotalUpdatedListener...');

    this.refresh();
  }

  activeBonusRewardChangedListener () {
    console.log('* Checking for existing "update rewards in cart" task...');
    if (isNil(this.updateBonusRewardsInCartTask)) {
      console.log('* No update rewards task in progress. Creating new "update rewards in cart" task...');
      this.updateBonusRewardsInCart(this.activeBonusReward);
    } else {
      console.log('* Found existing "update rewards in cart" task. Checking if "update rewards" task is already queued...');
      if (this.waitForUpdateIntervalId === -1) {
        console.log('* No existing "update rewards" task is queued. Queuing "update rewards" task...');
        this.waitForUpdateIntervalId = setInterval(() => {
          console.log('* Checking whether existing "update rewards" task has finished...');
          if (isNil(this.updateBonusRewardsInCartTask)) {
            console.log('* Existing "update rewards" task has finished. Creating new "update rewards in cart" task...');
            clearInterval(this.waitForUpdateIntervalId);
            this.waitForUpdateIntervalId = -1;
            this.updateBonusRewardsInCart(this.activeBonusReward);
          }
        }, 500);
      }
    }
  }

  updateBonusRewardsInCart (activeBonusReward) {
    this.updateBonusRewardsInCartTask = new UpdateBonusRewardsInCartTask(activeBonusReward);
    this.updateBonusRewardsInCartTask.on(COMPLETE, () => {
      this.updateBonusRewardsInCartTask = null;
      console.log('* Finished "update rewards in cart" task...')
      this.dispatchEvent(BONUS_REWARD_UPDATED);

      console.log('* Retrieving cart from /cart.js...');
      Shopify.getCart(Shopify.updateQuickCart);
    });
    console.log('* Starting "update rewards in cart" task...')
    this.updateBonusRewardsInCartTask.start();
  }

  updateCartListener () {
    Shopify.getCart(Shopify.updateQuickCart);
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

    return this.nextBonusReward.level - fireworksTotalInCart;
  }

  getProgressPercentage () {
    return Math.floor((RocketTheme.globals.dataStore.fireworksTotalInCart * 100) / this.nextBonusReward.level);
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
]

import {COMPLETE, FAIL} from '../utils/constants.js';
import { RocketTheme } from './RocketTheme.js';
import { BonusReward } from './BonusReward.js';
import { EventDispatcher } from '../utils/EventDispatcher.js';
import {BONUS_REWARD_UPDATED, FIREWORKS_TOTAL_IN_CART_UPDATED, UPDATE} from './Events.js';
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

    this.updateBonusRewardInProgress = false;
    this.updateBonusRewardCheckBuffered = false;
  }

  //================================================================================================
  // DEPENDENCIEES
  //================================================================================================

  setCartWatcher (cartWatcher) {
    this.cartWatcher = cartWatcher;
    this.cartWatcher.on(FIREWORKS_TOTAL_IN_CART_UPDATED, this.fireworksTotalUpdatedListener.bind(this));
    this.cartWatcher.on(UPDATE, this.cartWatcherUpdatedListener.bind(this));
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
      console.log('>>> Finished "update rewards in cart" task.')
      this.doPostUpdateActions();
    });

    this.updateBonusRewardsInCartTask.on(FAIL, () => {
      console.log('>>> Failed "update rewards in cart" task.')
      this.doPostUpdateActions();
    });

    console.log('* Starting "update rewards in cart" task...')
    this.updateBonusRewardsInCartTask.start();
  }

  doPostUpdateActions () {
    this.dispatchEvent(BONUS_REWARD_UPDATED);
    this.updateBonusRewardInProgress = false;
    let noRemainingUpdates = false;

    if (this.updateBonusRewardCheckBuffered) {
      console.log('>>> Processing buffered rewards check... ')
      this.updateBonusRewardCheckBuffered = false;
      if (this.getActiveBonusRewardHasChanged()) {
        console.log('>>> Buffered rewards check result: reward has changed.')
        this.handleActiveBonusRewardChange();
      } else {
        console.log('>>> Buffered rewards check result: reward has NOT changed. Update task not required.')
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

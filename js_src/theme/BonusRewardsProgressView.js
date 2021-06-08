import { notNil } from "../utils/utils";
import { BONUS_REWARD_UPDATED, FIREWORKS_TOTAL_IN_CART_UPDATED } from "./Events";
import { RocketTheme } from "./RocketTheme";


export class BonusRewardsProgressView {
  constructor (bonusRewards) {
    this.bonusRewards = bonusRewards;
    this.bonusRewards.on(BONUS_REWARD_UPDATED, this.bonusRewardUpdatedListener.bind(this));
  }

  //================================================================================================
  // DEPENDENCIEES
  //================================================================================================
  setCartWatcher (cartWatcher) {
    this.cartWatcher = cartWatcher;
    this.cartWatcher.on(FIREWORKS_TOTAL_IN_CART_UPDATED, this.fireworksTotalInCartUpdatedListener.bind(this));
    this.refresh();
  }

  //================================================================================================
  // LISTENERS
  //================================================================================================

  fireworksTotalInCartUpdatedListener () {
    this.updateProgressBar();
  }

  bonusRewardUpdatedListener () {
    this.showActiveBonusContainer()
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

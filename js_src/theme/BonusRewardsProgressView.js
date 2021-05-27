import { notNil } from "../utils/utils";
import { BONUS_REWARD_UPDATED, FIREWORKS_TOTAL_IN_CART_UPDATED } from "./Events";
import { RocketTheme } from "./RocketTheme";


export class BonusRewardsProgressView {
  constructor (bonusRewards) {
    this.bonusRewards = bonusRewards;

    this.bonusRewards.on(FIREWORKS_TOTAL_IN_CART_UPDATED, this.updateProgress.bind(this));
    this.bonusRewards.on(BONUS_REWARD_UPDATED, this.updateBonus.bind(this));
  }

  updateBonus () {
    if (notNil(document.querySelector('.template-cart'))) {
      let bonusContainers = document.querySelectorAll('.bonusRewards-container .bonus-tiered-container');
      bonusContainers.forEach(bonusContainer => {
        if (!bonusContainer.classList.contains('hidden')) {
          bonusContainer.classList.add('hidden');
        }
      });
      document.querySelector('.bonusRewards-container .level-' + this.bonusRewards.activeBonusReward.index).classList.remove('hidden');
    }

    this.displayBonus();
  }

  updateProgress () {
    // Show/Hide progress bar
    if (RocketTheme.globals.dataStore.fireworksTotalInCart === 0) {
      document.querySelector('.bonusRewards-progress').classList.add('hidden');
    } else {
      document.querySelector('.bonusRewards-progress').classList.remove('hidden');
    }
    document.querySelector(".bonusRewards-bar").style.width = this.bonusRewards.progressPercentage + '%';

    // Bonus Rewards message
    let remainingUntilNextLevel = Shopify.formatMoney(this.bonusRewards.remainingUntilNextLevel);
    let nextLevelIndex = this.bonusRewards.nextBonusReward.index;

    document.querySelector('.bonusRewards-message').innerHTML = 
    `<b>${remainingUntilNextLevel}</b> away from <b>Bonus Rewards Level ${nextLevelIndex}</b>! <i class="fas fa-gift"></i>`;
  }

  displayBonus () {
    if (notNil(document.querySelector('.template-cart'))) {
      document.querySelector('.bonusRewards-container').style.opacity = 1;
    } else {
      document.querySelector('.promo-bar .promo-bar-container').style.opacity = 1;
    }
  }
}
import { isNil } from '../utils/utils.js';
import { BonusRewards } from './BonusRewards.js';
import { BONUS_REWARD_UPDATED } from './Events.js';
import { RocketTheme } from './RocketTheme.js';


export class BonusRewardsProgressBannerView {

  constructor (bonusRewards) {
    this.bonusRewards = bonusRewards;
    this.bonusRewards.on(BONUS_REWARD_UPDATED, this.update.bind(this));
  }

  update () {
    if (isNil(document.querySelector('.template-cart'))) {
      let remainingUntilNextLevel = Shopify.formatMoney(this.bonusRewards.remainingUntilNextLevel);
      let nextLevelIndex = this.bonusRewards.nextBonusReward.index;

      // Fade in promo bar
      document.querySelector('.promo-bar .promo-bar-container').style.opacity = 1;

      document.querySelector('.bonusRewards-message').innerHTML = `<b>${remainingUntilNextLevel}</b> away from <b>Bonus Rewards Level ${nextLevelIndex}</b>! <i class="fas fa-gift"></i>`;

      // Show/Hide progress bar
      if (RocketTheme.globals.dataStore.fireworksTotalInCart === 0) {
        $('.bonusRewards-progress').addClass('hidden');
      } else {
        $('.bonusRewards-progress').removeClass('hidden');
      }
      document.querySelector('.promo-bar .bonusRewards-bar').style.width = this.bonusRewards.progressPercentage + '%';
    }
  }
}

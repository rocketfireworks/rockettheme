import { notNil } from "../utils/utils";
import { BonusRewards } from "./BonusRewards";
import { FIREWORKS_TOTAL_IN_CART_UPDATED } from "./Events";
import { RocketTheme } from "./RocketTheme";


export class BonusRewardsProgressInCartView {
  constructor (bonusRewards) {
    this.bonusRewards = bonusRewards;
    this. bonusRewards.on(FIREWORKS_TOTAL_IN_CART_UPDATED, this.update.bind(this));
  }

  update () {
    // Display active BonusReward
    if (notNil(document.querySelector('.template-cart'))) {
      let bonusContainers = document.querySelectorAll('.cartRewardsProgram .bonus-tiered-container');
      bonusContainers.forEach(bonusContainer => {
        if (!bonusContainer.classList.contains('hidden')) {
          bonusContainer.classList.add('hidden');
        }
      });
      document.querySelector('.cartRewardsProgram .level-' + BonusRewards.activeBonusReward.index).classList.remove('hidden');

      // Show/Hide progress bar
      if (RocketTheme.globals.dataStore.fireworksTotalInCart === 0) {
        document.querySelector('#cartrewardsProgress').classList.add('hidden');
      } else {
        document.querySelector('#cartrewardsProgress').classList.remove('hidden');
      }
      document.querySelector("#cartrewardsBar").style.width = BonusRewards.progress + '%';

      // Bonus Rewards message
      let remainingUntilNextLevel = Shopify.formatMoney(BonusRewards.remainingUntilNextLevel);
      let nextLevelIndex = BonusRewards.nextBonusReward.index;

      document.querySelector('.cartRewardsProgram .bonus-tiered-mtv').innerHTML = 
      `<b>${remainingUntilNextLevel}</b> away from <b>Bonus Rewards Level ${nextLevelIndex}</b>! <i class="fas fa-gift"></i>`;
    }
  }
}
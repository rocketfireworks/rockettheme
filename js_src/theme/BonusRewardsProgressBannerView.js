import { FIREWORKS_TOTAL_IN_CART_UPDATED } from './Events.js';
import { RocketTheme } from './RocketTheme.js';


export class BonusRewardsProgressBannerView {

  constructor (bonusRewards) {
    this.bonusRewards = bonusRewards;
    this.bonusRewards.on(FIREWORKS_TOTAL_IN_CART_UPDATED, this.update.bind(this));
  }

  update () {
    document.querySelector('#bonusrewardsprogress').textContent = RocketTheme.globals.dataStore.fireworksTotalInCart;
  }
}

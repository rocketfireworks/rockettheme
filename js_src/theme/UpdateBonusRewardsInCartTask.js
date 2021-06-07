import { ShopifyCart } from "../shopify/ShopifyCart";
import { TaskManager } from "../utils/TaskManager";
import { notNil } from "../utils/utils";
import { BonusRewards } from "./BonusRewards";
import { ProductService } from "./ProductService";
import { RocketTheme } from "./RocketTheme";
import {RefreshCartWatcherTask} from './RefreshCartWatcherTask.js';

export class UpdateBonusRewardsInCartTask extends TaskManager {
  constructor (bonusRewardToAdd) {
    super('UPDATE BONUS REWARDS IN CART');

    this.initTasks(bonusRewardToAdd);
  }

  initTasks (bonusRewardToAdd) {
    let tasks = this.getRemoveAllBonusRewardsFromCartTasks();

    if (notNil(bonusRewardToAdd)) {
      let addActiveBonusRewardTask = this.getAddBonusRewardToCartTask(bonusRewardToAdd);
      tasks.push(addActiveBonusRewardTask);
    }

    // After the bonus rewards have been removed from and added to the server-side cart, retrieve
    // the cart's state again so the local cart reflects the changed bonus rewards.
    tasks.push(new RefreshCartWatcherTask(RocketTheme.globals.cartWatcher));
    
    this.addTasks(tasks);
  }

  start() {
    super.start();
  }

  getRemoveAllBonusRewardsFromCartTasks () {
    let removeTasks = [];
    console.log('* Removing all bonus rewards from cart')
    RocketTheme.globals.dataStore.productsInCart.forEach(productObj => {
      BonusRewards.levels.forEach(bonus => {
        let variantID = ProductService.getVariantID(productObj);
        if (variantID === bonus.id) {
          removeTasks.push(ShopifyCart.getRemoveFromCartTask(variantID));
          console.log('* Queuing bonus reward for removal:', bonus);
        }
      });
    });
    return removeTasks;
  }

  getAddBonusRewardToCartTask (bonusReward) {
    console.log('* Queuing bonus reward for addition:', bonusReward);
    return ShopifyCart.getAddToCartTask(bonusReward.id);
  }
}

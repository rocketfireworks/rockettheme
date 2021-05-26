import { ShopifyCart } from "../shopify/ShopifyCart";
import { TaskManager } from "../utils/TaskManager";
import { BonusRewards } from "./BonusRewards";
import { RocketTheme } from "./RocketTheme";


export class UpdateBonusRewardsInCartTask extends TaskManager {
  constructor (bonusRewardToAdd) {
    super('UPDATE BONUS REWARDS IN CART');

    this.initTasks(bonusRewardToAdd);
  }

  initTasks (bonusRewardToAdd) {
    let removeInactiveBonusRewardsTask = this.getRemoveAllBonusRewardsFromCartTasks();
    let addActiveBonusRewardTask = this.getAddBonusRewardToCartTask(bonusRewardToAdd);
    let tasks = removeInactiveBonusRewardsTask;
    tasks.push(addActiveBonusRewardTask);
    this.addTasks(tasks);
  }

  start() {
    super.start();
  }

  getRemoveAllBonusRewardsFromCartTasks () {
    let removeTasks = [];
    RocketTheme.globals.dataStore.productsInCart.forEach(productObj => {
      BonusRewards.levels.forEach(bonus => {
        if (productObj.product.variants[0].id === bonus.id) {
          removeTasks.push(ShopifyCart.getRemoveFromCartTask(productObj.product.variants[0].id));
        }
      });
    });
    return removeTasks;
  }

  getAddBonusRewardToCartTask (bonusReward) {
    return ShopifyCart.getAddToCartTask(bonusReward.id);
  }
}
import { ShopifyCart } from "../shopify/ShopifyCart";
import { TaskManager } from "../utils/TaskManager";
import { notNil } from "../utils/utils";
import { BonusRewards } from "./BonusRewards";
import { ProductService } from "./ProductService";
import { RocketTheme } from "./RocketTheme";


export class UpdateBonusRewardsInCartTask extends TaskManager {
  constructor (bonusRewardToAdd) {
    super('UPDATE BONUS REWARDS IN CART');

    this.initTasks(bonusRewardToAdd);
  }

  initTasks (bonusRewardToAdd) {
    let removeInactiveBonusRewardsTask = this.getRemoveAllBonusRewardsFromCartTasks();
    let tasks = removeInactiveBonusRewardsTask;

    if (notNil(bonusRewardToAdd)) {
      let addActiveBonusRewardTask = this.getAddBonusRewardToCartTask(bonusRewardToAdd);
      tasks.push(addActiveBonusRewardTask);
    }
    
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
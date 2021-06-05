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
    RocketTheme.globals.dataStore.productsInCart.forEach(productObj => {
      BonusRewards.levels.forEach(bonus => {
          console.log('###Bonus removed:');
          console.log(productObj.product.variants[0]);
        let variantID = ProductService.getVariantID(productObj);
        if (variantID === bonus.id) {
          removeTasks.push(ShopifyCart.getRemoveFromCartTask(variantID));
        }
      });
    });
    return removeTasks;
  }

  getAddBonusRewardToCartTask (bonusReward) {
    console.log('###Bonus added:');
    console.log(bonusReward);
    return ShopifyCart.getAddToCartTask(bonusReward.id);
  }
}
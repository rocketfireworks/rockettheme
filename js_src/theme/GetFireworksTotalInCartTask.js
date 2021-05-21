import { TAG_FW } from "../utils/constants";
import { Task } from "../utils/Task";
import { sumProducts } from "../utils/utils";
import { RocketTheme } from "./RocketTheme";


export class GetFireworksInCartTotalTask extends Task {
  
  constructor () {
    super();

    this.name = 'GET FIREWORKS IN CART TOTAL';
  }

  start() {
    super.start();

    let fireworksProducts = RocketTheme.globals.dataStore.productsInCart.filter(element => element.product.tags.includes(TAG_FW))
    RocketTheme.globals.dataStore.fireworksTotalInCart = sumProducts(fireworksProducts);
    this.done();
  }
}
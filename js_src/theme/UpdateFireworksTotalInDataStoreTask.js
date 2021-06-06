import { SellyService } from "../appapis/SellyService";
import { Task } from "../utils/Task";
import { sumBy } from "../utils/utils";
import { ProductService } from "./ProductService";
import { RocketTheme } from "./RocketTheme";

export class UpdateFireworksTotalInDataStoreTask extends Task {
  
  constructor () {
    super();

    this.name = 'GET FIREWORKS IN CART TOTAL';
  }

  start() {
    super.start();

    console.log('* Calculating fireworks total');

    let fireworksProducts = [];
    
    RocketTheme.globals.dataStore.cart.items.forEach(item => {
      if (ProductService.isFireworkProduct(item.handle)) {
        fireworksProducts.push({
          handle: item.handle,
          product_id: item.product_id,
          unitFinalPrice: SellyService.getFinalUnitPrice(item.product_id, item.quantity, item.price),
          lineItemTotalFinalPrice: item.quantity * SellyService.getFinalUnitPrice(item.product_id, item.quantity, item.price)
        });
      }
    });

    console.log('=================');
    console.log(fireworksProducts);

    RocketTheme.globals.dataStore.fireworksTotalInCart = sumBy(fireworksProducts, 'lineItemTotalFinalPrice');
    console.log('* Fireworks total: ' + RocketTheme.globals.dataStore.fireworksTotalInCart);
    this.done();
  }
}

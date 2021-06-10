import { SellyService } from "../appapis/SellyService";
import { EventDispatcher } from "../utils/EventDispatcher";
import { sumBy } from "../utils/utils";
import { UPDATE } from "./Events";
import { RocketTheme } from "./RocketTheme";


export class CartTotalManager extends EventDispatcher {
  constructor (datastore) {
    super();
    this.datastore = datastore;

    RocketTheme.globals.cartWatcher.on(UPDATE, this.cartUpdateListener.bind(this));
    this.setCartTotalInDataStore();
  }

  cartUpdateListener () {
    console.log('%%CART TOTAL MANAGER RECEIVE UPDATE');
    this.setCartTotalInDataStore();
  }

  setCartTotalInDataStore () {
    console.log('%%', RocketTheme.globals.dataStore.productsInCart);
    let products = [];

    RocketTheme.globals.dataStore.cart.items.forEach(item => {
      products.push({
        handle: item.handle,
        product_id: item.product_id,
        unitFinalPrice: SellyService.getFinalUnitPrice(item.product_id, item.quantity, item.price),
        lineItemTotalFinalPrice: item.quantity * SellyService.getFinalUnitPrice(item.product_id, item.quantity, item.price)
      });
    });

    RocketTheme.globals.dataStore.totalInCart = sumBy(products, 'lineItemTotalFinalPrice');
    console.log('%%Local cart total: ' + RocketTheme.globals.dataStore.totalInCart);
    this.dispatchEvent(UPDATE);
  }
}
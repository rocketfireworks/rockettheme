import { ShopifyCart } from "../shopify/ShopifyCart";
import { COMPLETE } from "../utils/constants";
import { TaskManager } from "../utils/TaskManager";
import { RocketTheme } from "./RocketTheme";


export class UpdateCartProductsInDataStoreTask extends TaskManager {
  
  constructor () {
    super('GET ALL PRODUCTS IN CART');

    // DEBUGGING CODE:
    // If productsInCart and the cart.items ever have different lengths, something has gone wrong,
    // and the cause should be investigated.
    this.on(COMPLETE, () => {
      if (RocketTheme.globals.dataStore.productsInCart.length
        !== RocketTheme.globals.dataStore.cart.items.length) {
        console.warn('cart.items and productsInCart MISMATCH')
        console.log('datastore.cart.items: ', RocketTheme.globals.dataStore.cart.items);
        console.log('datastore.productsInCart: ', RocketTheme.globals.dataStore.productsInCart)
      }
    });
  }

  initTasks () {
    this.tasks = [];
    let cart = RocketTheme.globals.dataStore.cart;
    let newTasks = [];

    cart.items.forEach(item => {
      let getProductTask = ShopifyCart.getProductTask(item.url + '.js');
      getProductTask.on(COMPLETE, () => {
        RocketTheme.globals.dataStore.productsInCart.push(getProductTask.json);
      });
      newTasks.push(getProductTask);
    });
    this.addTasks(newTasks);
  }

  start() {
    console.log('* Retrieving products from server');
    this.clearProductsInCart();
    this.initTasks();
    super.start();
  }

  clearProductsInCart () {
    RocketTheme.globals.dataStore.productsInCart = [];
  }
}

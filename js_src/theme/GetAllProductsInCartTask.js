import { ShopifyCart } from "../shopify/ShopifyCart";
import { COMPLETE } from "../utils/constants";
import { TaskManager } from "../utils/TaskManager";
import { RocketTheme } from "./RocketTheme";


export class GetAllProductsInCartTask extends TaskManager {
  
  constructor () {
    super('GET ALL PRODUCTS IN CART');
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
    this.clearProductsInCart();
    this.initTasks();
    super.start();
  }

  clearProductsInCart () {
    RocketTheme.globals.dataStore.productsInCart = [];
  }
}
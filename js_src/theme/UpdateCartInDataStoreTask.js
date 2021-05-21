import { ShopifyCart } from "../shopify/ShopifyCart";
import { COMPLETE } from "../utils/constants";
import { Task } from "../utils/Task";
import { RocketTheme } from "./RocketTheme";



export class UpdateCartInDataStoreTask extends Task {

  constructor () {
    super();
    this.name = "UpdateCartInDataStore";
  }

  start () {
    super.start();
    
    let getCartTask = ShopifyCart.getCartTask();
    getCartTask.on(COMPLETE, () => {
      RocketTheme.globals.dataStore.cart = getCartTask.json;
      this.done();
    })
    getCartTask.start();
  }
}
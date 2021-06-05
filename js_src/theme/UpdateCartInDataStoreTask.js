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
    console.log('* Retrieving cart from server');
    getCartTask.on(COMPLETE, () => {
      RocketTheme.globals.dataStore.cart = getCartTask.json;
      console.log('* Received cart from server');
      this.done();
    })
    getCartTask.start();
  }
}
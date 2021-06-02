import { Task } from "../utils/Task";
import { notNil } from "../utils/utils";


export class WaitForShopifySDK extends Task {
  constructor () {
    super();
    this.name = "WAIT FOR SHOPIFY SDK";
  }

  start () {
    super.start();

    this.checkShopifySDK();

    if (!this.complete) {
      this.checkShopifySDKIntervalID = setInterval(() => {
        this.checkShopifySDK();
        if (this.complete) {
          clearInterval(this.checkShopifySDKIntervalID);
        }
      }, 200);
    }
  }

  checkShopifySDK () {
    if (notNil(Shopify)) {
      if (notNil(Shopify.onCartUpdate)) {
        this.done();
      }
    }
  }
}
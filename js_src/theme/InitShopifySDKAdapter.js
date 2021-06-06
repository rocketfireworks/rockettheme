import {Task} from '../utils/Task.js';
import {ShopifySDKAdapter} from '../shopify/ShopifySDKAdapter.js';


export class InitShopifySDKAdapter extends Task {
  constructor (rocketTheme) {
    super();
    this.name = 'INIT SHOPIFY SDK ADAPTER';
    this.rocketTheme = rocketTheme;
  }

  start () {
    super.start();
    this.rocketTheme.shopifySDKAdapter = new ShopifySDKAdapter();
    this.done();
  }
}

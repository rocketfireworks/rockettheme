import {Task} from '../utils/Task.js';
import {ShopifySDKAdapter} from '../shopify/ShopifySDKAdapter.js';
import {RocketTheme} from './RocketTheme.js';


export class InitShopifySDKAdapter extends Task {
  constructor () {
    super();
    this.name = 'INIT SHOPIFY SDK ADAPTER';
  }

  start () {
    super.start();
    RocketTheme.globals.shopifySDKAdapter = new ShopifySDKAdapter();
    this.done();
  }
}

import { SHOPIFY_CART_UPDATE } from "../theme/Events";
import { EventDispatcher } from "../utils/EventDispatcher";


export class ShopifySDKAdapter extends EventDispatcher {
  constructor () {
    super();
    this.applyAdapter();
  }

  applyAdapter () {
    let originalShopifyOnCartUpdate = Shopify.onCartUpdate;
    Shopify.onCartUpdate = (cart, form) => {
      originalShopifyOnCartUpdate(cart, form);
      this.handleCartUpdate();
    }
  }

  handleCartUpdate () {
    this.dispatchEvent(SHOPIFY_CART_UPDATE);
  }
}

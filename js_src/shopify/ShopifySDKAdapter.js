import { SHOPIFY_CART_UPDATE } from "../theme/Events";
import { EventDispatcher } from "../utils/EventDispatcher";


export class ShopifySDKAdapter extends EventDispatcher {
  constructor () {
    super();
    
    this.onCartUpdate();
  }

  onCartUpdate () {
    let originalShopifyOnCartUpdate = Shopify.onCartUpdate;
    Shopify.onCartUpdate = (cart, form) => {
      originalShopifyOnCartUpdate(cart, form);
      this.dispatchEvent(SHOPIFY_CART_UPDATE);
    }
  }
}

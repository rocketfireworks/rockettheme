import { SHOPIFY_CART_UPDATE, SHOPIFY_CHANGE_ITEM_BY_LINE_REQUESTED } from "../theme/Events";
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
    
    let originalShopifyChangeItemByLine = Shopify.changeItemByLine;
    Shopify.changeItemByLine = (line, quantity, callback) => {
      originalShopifyChangeItemByLine(line, quantity, callback);
      this.handleChangeItemByLine();
    }
  }

  handleCartUpdate () {
    this.dispatchEvent(SHOPIFY_CART_UPDATE);
  }

  handleChangeItemByLine () {
    this.dispatchEvent(SHOPIFY_CHANGE_ITEM_BY_LINE_REQUESTED);
  }
}

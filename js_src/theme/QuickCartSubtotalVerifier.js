import { notNil } from "../utils/utils";
import { SHOPIFY_CHANGE_ITEM_BY_LINE_REQUESTED, UPDATE } from "./Events";
import { RocketTheme } from "./RocketTheme";


export class QuickCartSubtotalVerifier {
  constructor (cartTotalManager) {
    this.firstVerificationTimeoutID;
    this.secondVerificationTimeoutID;

    this.cartTotalManager = cartTotalManager;
    this.cartTotalManager.on(UPDATE, this.cartTotalUpdateListener.bind(this));

    RocketTheme.globals.shopifySDKAdapter.on(SHOPIFY_CHANGE_ITEM_BY_LINE_REQUESTED, this.shopifyChangeItemByLineRequestedListener.bind(this));
  }

  cartTotalUpdateListener () {
    this.scheduleSubtotalVerification();
  }

  shopifyChangeItemByLineRequestedListener () {
    this.cancelSubtotalVerification();
  }

  scheduleSubtotalVerification () {
    this.cancelSubtotalVerification();

    this.firstVerificationTimeoutID = setTimeout(() => {
      let renderedPrice = this.getRenderedPrice();
      let flooredLocalCartTotal = this.getFlooredLocalCartTotal();
      if (notNil(renderedPrice)) {
        console.log('%% Rendered price: ', renderedPrice);
        console.log('%% Floored cart total: ', flooredLocalCartTotal);
  
        if (Math.abs(flooredLocalCartTotal - renderedPrice) > 1) {
          console.log('~~~Subtotal are different!!! Floored Local Cart Total: ', flooredLocalCartTotal, 'Rendered subtotal: ', renderedPrice);
          
          // Unresolvable mismatch between the client-side subtotal and the actual correct server-side subtotal,
          // so there is no alternative but to reload. This very rare problem occurs when items are added to and
          // removed from the cart in quick succession. It does not occur for products without a Selly discount. 
          // But when a Selly discount is applied, the quantity of items in the cart as reported by the Shopify 
          // AJAX API sometimes falls out of synchronization with the actual correct server-side quantity 
          this.secondVerificationTimeoutID = setTimeout(() => {
            // Get updated prices
            renderedPrice = this.getRenderedPrice();
            flooredLocalCartTotal = this.getFlooredLocalCartTotal();
            if (notNil(renderedPrice)) {
              if (Math.abs(flooredLocalCartTotal - renderedPrice) > 1) {
                location.reload();
              }
            }
          }, 5000);
        } else {
          console.log('~~~Subtotal check okay. Floored Local Cart Total: ', flooredLocalCartTotal, 'Rendered subtotal: ', renderedPrice);
        }
      }
    }, 2000);
  }

  cancelSubtotalVerification () {
    clearTimeout(this.firstVerificationTimeoutID);
    clearTimeout(this.secondVerificationTimeoutID);
  }

  getFlooredLocalCartTotal () {
    return Math.floor(RocketTheme.globals.dataStore.totalInCart);
  }

  getRenderedPrice () {
    let renderedPrice;
    let normalPriceSpan = document.querySelector('.total_row .tdf_price_normal .tdf_money.money');
    if (notNil(normalPriceSpan)) {
      renderedPrice = parseFloat(normalPriceSpan.textContent.substr(1)) * 100;
    }
    return renderedPrice;
  }
}
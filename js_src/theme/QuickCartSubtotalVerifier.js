import { notNil } from "../utils/utils";
import { UPDATE } from "./Events";
import { RocketTheme } from "./RocketTheme";


export class QuickCartSubtotalVerifier {
  constructor (cartTotalManager) {
    this.cartTotalManager = cartTotalManager;
    this.cartTotalManager.on(UPDATE, this.cartTotalUpdateListener.bind(this));
  }

  cartTotalUpdateListener () {
    setTimeout(() => {
      let renderedPrice;
      let normalPriceSpan = document.querySelector('.tdf_price_normal .tdf_money.money');
      let flooredLocalCartTotal = Math.floor(RocketTheme.globals.dataStore.totalInCart);
      if (notNil(normalPriceSpan)) {
        renderedPrice = parseFloat(normalPriceSpan.textContent.substr(1)) * 100;
        console.log('%% Rendered price: ', renderedPrice);
        console.log('%% Floored cart total: ', flooredLocalCartTotal);
        console.log('%% Normal price span: ', normalPriceSpan);
  
        if (Math.abs(flooredLocalCartTotal - renderedPrice) > 1) {
          console.log('~~~Subtotal are different!!! Floored Local Cart Total: ', flooredLocalCartTotal, 'Rendered subtotal: ', renderedPrice);
          
          // Unresolvable mismatch between the client-side subtotal and the actual correct server-side subtotal,
          // so there is no alternative but to reload. This very rare problem occurs when items are added to and
          // removed from the cart in quick succession. It does not occur for products without a Selly discount. 
          // But when a Selly discount is applied, the quantity of items in the cart as reported by the Shopify 
          // AJAX API sometimes falls out of synchronization with the actual correct server-side quantity 
           setTimeout(() => {
            // Get updated prices
            normalPriceSpan = document.querySelector('.tdf_price_normal .tdf_money.money');
            flooredLocalCartTotal = Math.floor(RocketTheme.globals.dataStore.totalInCart);
            if (notNil(normalPriceSpan)) {
                renderedPrice = parseFloat(normalPriceSpan.textContent.substr(1)) * 100;
            }
            debugger;
            if (Math.abs(flooredLocalCartTotal - renderedPrice) > 1) {
              location.reload();
            }
          }, 5000);
        } else {
          console.log('~~~Subtotal check okay. Floored Local Cart Total: ', flooredLocalCartTotal, 'Rendered subtotal: ', renderedPrice);
        }
      }
    }, 2000);
  }
}
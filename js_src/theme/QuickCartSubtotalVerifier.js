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
      let floorLocalCartTotal = Math.floor(RocketTheme.globals.dataStore.totalInCart);
      if (notNil(normalPriceSpan)) {
        renderedPrice = parseFloat(normalPriceSpan.textContent.substr(1)) * 100;
        console.log('%% Rendered price: ', renderedPrice);
        console.log('%% Floor cart total: ', floorLocalCartTotal);
      }
      console.log('%% Normal price span: ', normalPriceSpan);
  
      if (Math.abs(floorLocalCartTotal - renderedPrice) > 1) {
        console.log('%%%Subtotal are different!!!');
        
      } else {
        console.log('%%Subtotal check okay');
      }
    }, 2000);
  }
}
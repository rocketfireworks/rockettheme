import { SellyService } from "../appapis/SellyService";
import { notEmpty, notNil } from "../utils/utils";

export class SellyDiscountOnCartView {
  constructor () {
    this.updateCheckoutPage();
  }

  update () {
    let lineItems = document.querySelectorAll('.productRow');
    if (notNil(lineItems)) {
      lineItems.forEach(lineItem => {
        
        let item = {};
        item.id = lineItem.querySelector('.discount-wholesale-motivation').getAttribute('data-product-id');
        item.quantity = null;
        item.original_price = 0;

        let quantity = lineItem.querySelector('.productRowQty input');
        if (notNil(quantity)) {
          item.quantity = quantity.value;
        }

        let originalPrice = lineItem.querySelector('.productRowPrice .money .tdf_money.money');
        if (notNil(originalPrice)) {
          item.originalPrice = originalPrice.getAttribute('data-origin-value');
        }

        // Update motivational message
        let motivationalMessage = SellyService.getMotivationalMessage(item.id, item.quantity, item.originalPrice);
        lineItem.querySelector('.discount-wholesale-motivation').innerHTML = motivationalMessage;

        // Update discount message
        let discountMessage = SellyService.getCurrentDiscount(item.id, item.quantity);
        if (notEmpty(discountMessage)) {
          lineItem.querySelector('.currentDiscount').innerHTML = discountMessage;
          lineItem.querySelector('.currentDiscount').classList.remove('hidden');
        }
      });
    }
  }

  updateCheckoutPage () {
    let checkoutPage = document.querySelector('.template-cart');
    if (notNil(checkoutPage)) {
      this.update();
    }
  }

  getMotivationalMessage (productID, quantity, originalPrice) {
    return SellyService.getMotivationalMessage(productID, quantity, originalPrice);
  }

  getCurrentDiscount (productID, quantity) {
    return SellyService.getCurrentDiscount(productID, quantity);
  }

  getFinalUnitPrice (productID, quantity, originalPrice) {
    return SellyService.getFinalUnitPrice(productID, quantity, originalPrice);
  }
}
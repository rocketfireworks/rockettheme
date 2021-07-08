import { SellyService } from "../appapis/SellyService";
import { EventDispatcher } from "../utils/EventDispatcher";
import { notNil } from "../utils/utils";
import { UPDATE } from "./Events";
import { RocketTheme } from "./RocketTheme";

export class UpdateDiscountOnProductPage extends EventDispatcher {
  constructor () {
    super();

    this.updateDiscountOnProductPage();
  }

  //================================================================================================
  // DEPENDENCIEES
  //================================================================================================

  setCartWatcher (cartWatcher) {
    this.cartWatcher = cartWatcher;
    this.cartWatcher.on(UPDATE, this.cartUpdatedListener.bind(this));
  }

  //================================================================================================
  // LISTENERS
  //================================================================================================

  cartUpdatedListener () {
    console.log('~~~Update motivational message on product page');
    this.updateDiscountOnProductPage();
  }

  //================================================================================================
  // GET DATA FROM PAGE
  //================================================================================================

  getCurrentProductID () {
    let productID = null;
    if (notNil(meta.product)) {
      productID = meta.product.id;
    }
    return productID;
  }

  //================================================================================================
  // RENDERING
  //================================================================================================

  updateDiscountOnProductPage () {
    let currentProduct = this.getCurrentProductData();
    
    if (notNil(currentProduct.id)) {
      let discountProducts = SellyService.getAllProducts();
      discountProducts.forEach(discountProduct => {
        if (currentProduct.id === discountProduct.i) {
          let finalUnitPrice = SellyService.getFinalUnitPrice(currentProduct.id, currentProduct.quantity, currentProduct.price);
          if (finalUnitPrice !== currentProduct.price) {
            this.updateProductPrice(finalUnitPrice, true);
          } else {
            this.updateProductPrice(finalUnitPrice, false);
          }

          let motivationalMessage = SellyService.updateMotivationalMessage(currentProduct.id, currentProduct.quantity, currentProduct.price);

          if (notNil(motivationalMessage)) {
            this.setMotivationalMessage(motivationalMessage);
          } else {
            this.clearMotivationalMessage(motivationalMessage);
          }
        }
      });
    }
  }

  updateProductPrice (price, hasDiscount) {
    let formattedPrice = Shopify.formatMoney(price, app.data.money_format);
    let priceContainer = document.querySelector('.price-wholesale');
    let existingPrice = document.querySelector('#productPrice');

    if (hasDiscount) {
      existingPrice.classList.add('linethrough');
      priceContainer.innerHTML = `<div>Your bulk price:</div>
        <div class="money" data-tov="${formattedPrice}" data-tovc="CAD" data-origin-value="${price}" data-currency="CAD">${formattedPrice}</div>`;
    } else {
      existingPrice.classList.remove('linethrough');
      priceContainer.innerHTML = '';
    }
  }

  getCurrentProductData () {
    let currentProductData = {};
    RocketTheme.globals.dataStore.cart.items.forEach(item => {
      currentProductData.id = this.getCurrentProductID();
      if (currentProductData.id === item.product_id) {
        currentProductData.quantity = item.quantity;
        currentProductData.price = item.original_price;
      }
    });
    return currentProductData;
  }

  setMotivationalMessage (motivationalMessage) {
    document.querySelector('.motivational-message').innerHTML = motivationalMessage;
  }
  
  clearMotivationalMessage () {
    document.querySelector('.motivational-message').innerHTML = '';
  }
}
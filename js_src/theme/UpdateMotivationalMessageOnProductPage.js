import { SellyService } from "../appapis/SellyService";
import { EventDispatcher } from "../utils/EventDispatcher";
import { notNil } from "../utils/utils";
import { UPDATE } from "./Events";
import { RocketTheme } from "./RocketTheme";

export class UpdateMotivationalMessageOnProductPage extends EventDispatcher {
  constructor () {
    super();

    this.updateMotivationalMessageOnPage();
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
    this.updateMotivationalMessageOnPage();
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

  updateMotivationalMessageOnPage () {
    let currentProduct = this.getCurrentProductData();
    
    if (notNil(currentProduct.id)) {
      let discountProducts = SellyService.getAllProducts();
      discountProducts.forEach(discountProduct => {
        if (currentProduct.id === discountProduct.i) {
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
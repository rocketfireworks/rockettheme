import { isNil, notNil } from "../utils/utils";


export class SellyService {
}

SellyService.data = {};

SellyService.getFinalUnitPrice = function (productID, quantity, originalPrice) {
  let activeOffers = SellyService.getActiveOffersForProduct(productID);
  let finalUnitPrice = originalPrice;

  activeOffers.forEach(offer => {
    if (offer.offerType === SellyService.OFFER_TYPE_BULK) {
      let discount = SellyService.getActiveDiscountForQuantity(offer.offerObj, quantity);
      if (notNil(discount)){
        switch (discount.type_id) {
          case SellyService.DISCOUNT_TYPE_PERCENT:
            finalUnitPrice = originalPrice - (originalPrice * (discount.value/100));
            break;
  
          case SellyService.DISCOUNT_TYPE_FIXED_AMOUNT_DISCOUNT:
            finalUnitPrice = originalPrice - (discount.value * 100);
            break;

          case SellyService.DISCOUNT_TYPE_FIXED_PRICE:
            finalUnitPrice = discount.value;
            break;
        }
      }
    }
  });

  return finalUnitPrice;
}

SellyService.getActiveOffersForProduct = function (productID) {
  let activeOffers = [];
  if (notNil(SellyService.data)) {
    Object.keys(SellyService.data.offers).forEach(offerType => {
      for (const [offerID, offerObj] of Object.entries(SellyService.data.offers[offerType])) {
        if (offerObj.product_groups[0].ids.includes(productID)) {
          activeOffers.push({
            offerType: offerType,
            offerObj: offerObj
          });
        }
      }
    });
  }

  return activeOffers;
}

SellyService.getActiveDiscountForQuantity = function (offer, quantity) {
  let discount = null;
  offer.discount.value.levels.forEach(level => {
    if (quantity >= level.quantity) {
      discount = level.discount;
    }
  });

  return discount;
}

SellyService.getNextLevelDiscountForQuantity = function (offer, quantity) {
  let nextLevelDiscount = null;
  let offerLevels = offer.discount.value.levels;
  
  offerLevels.forEach((level, index) => {
    if (quantity >= level.quantity) {
      let nextLevel = offerLevels[index + 1];
      if (notNil(nextLevel)) {
        return nextLevelDiscount = nextLevel;
      }
    }
  });
  
  if (quantity < offerLevels[0].quantity) {
    nextLevelDiscount = offerLevels[0];
  } 
  
  if (quantity === 0) {
    nextLevelDiscount = null;
  }

  return nextLevelDiscount;
}

SellyService.getProduct = function (productID) {
  if (notNil(SellyService.data)) {
    return SellyService.data.products[productID];
  }
}

SellyService.getAllProducts = function () {
  let allProducts = [];
  if (notNil(SellyService.data)) {
    for (const [productID, product] of Object.entries(SellyService.data.products)) {
      allProducts.push(product);
    }
  }
  return allProducts;
}

SellyService.getMotivationalMessage = function (offer) {
  return offer.mtv_message;
}

SellyService.updateMotivationalMessage = function (productID, quantity, originalPrice) {
  let activeOffers = SellyService.getActiveOffersForProduct(productID);
  let motivationalMessage = '';

  activeOffers.forEach(offer => {
    if (offer.offerType === SellyService.OFFER_TYPE_BULK) {
      let nextLevelDiscount = SellyService.getNextLevelDiscountForQuantity(offer.offerObj, quantity);
      if (notNil(nextLevelDiscount)) {
        let remainingQuantity = nextLevelDiscount.quantity - quantity;
        motivationalMessage = SellyService.getMotivationalMessage(offer.offerObj);
        motivationalMessage = motivationalMessage.replace('{quantity}', remainingQuantity);

        switch (nextLevelDiscount.discount.type_id) {
          case SellyService.DISCOUNT_TYPE_PERCENT:
            motivationalMessage = motivationalMessage.replace('{discount}', nextLevelDiscount.discount.value + '% Off');
            break;
  
          case SellyService.DISCOUNT_TYPE_FIXED_AMOUNT_DISCOUNT:
            motivationalMessage = motivationalMessage.replace('{discount}', '$' + nextLevelDiscount.discount.value + ' Off');
            break;

          case SellyService.DISCOUNT_TYPE_FIXED_PRICE:
            let valueOff = ((originalPrice / 100 * nextLevelDiscount.quantity) - nextLevelDiscount.discount.value).toFixed(2);
            motivationalMessage = motivationalMessage.replace('{discount}', '$' + valueOff + ' Off');
            break;
        }

      } else if (isNil(nextLevelDiscount)) {
        motivationalMessage = '';
      }
    }
  });
  return motivationalMessage;
}
SellyService.OFFER_TYPE_BULK = '7';
SellyService.DISCOUNT_TYPE_PERCENT = 1;
SellyService.DISCOUNT_TYPE_FIXED_AMOUNT_DISCOUNT = 2;
SellyService.DISCOUNT_TYPE_FIXED_PRICE = 7;
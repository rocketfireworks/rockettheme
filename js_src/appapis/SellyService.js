import { notNil } from "../utils/utils";


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
            finalUnitPrice = originalPrice - discount.value;
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

SellyService.getProduct = function (productID) {
  if (notNil(SellyService.data)) {
    return SellyService.data.products[productID];
  }
}

SellyService.getMotivationalMessage = function (activeOffer) {
  return activeOffer.offerObj.mtv_message;
}

SellyService.OFFER_TYPE_BULK = '7';
SellyService.DISCOUNT_TYPE_PERCENT = 1;
SellyService.DISCOUNT_TYPE_FIXED_AMOUNT_DISCOUNT = 2;
SellyService.DISCOUNT_TYPE_FIXED_PRICE = 3;
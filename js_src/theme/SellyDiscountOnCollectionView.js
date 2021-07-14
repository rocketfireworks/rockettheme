import { SellyService } from "../appapis/SellyService";

export class SellyDiscountOnCollectionView {
  constructor () {
  }

  update () {
    let products = document.querySelectorAll('.add-to-cart-form');
    products.forEach(product => {
      let productData = product.querySelectorAll('.product-data');
      productData.forEach(productD => {
        if (productD) {
          let productId = productD.getAttribute('data-product-id');
          let productUrl = productD.getAttribute('data-product-url');
          let originalPrice = productD.getAttribute('data-product-price');

          let activeOffers = SellyService.getActiveOffersForProduct(productId);

          if (Object.keys(activeOffers).length !== 0) {
            activeOffers.forEach(offer => {
              let discount = offer.offerObj.discount;
              let highestDiscountLevel = discount.value.levels.length - 1;
              let highestDiscountQuantity = discount.value.levels[highestDiscountLevel].quantity;
              let highestDiscountType = discount.value.levels[highestDiscountLevel].discount.type_id;
              
              let discountPrice = SellyService.getFinalUnitPrice(productId, highestDiscountQuantity, originalPrice);
              let formattedDiscountPrice = Shopify.formatMoney(discountPrice, app.data.money_format);

              switch (highestDiscountType) {
                case SellyService.DISCOUNT_TYPE_PERCENT:
                  productD.innerHTML = `<a href="/products/${productUrl}" class="bulk-pricing">Bulk Deal: ${formattedDiscountPrice}...</a>`;
                  break;
        
                case SellyService.DISCOUNT_TYPE_FIXED_AMOUNT_DISCOUNT:
                  productD.innerHTML = `<a href="/products/${productUrl}" class="bulk-pricing">Bulk Deal: ${formattedDiscountPrice}...</a>`;
                  break;

                case SellyService.DISCOUNT_TYPE_FIXED_PRICE:
                  productD.innerHTML = `<a href="/products/${productUrl}" class="bulk-pricing">Bulk Deal: ${formattedDiscountPrice}...</a>`;
                  break;
              }
            });
          }
        }
      });
    });
  }
}
import { TAG_FW, TAG_FWSEQ } from "../utils/constants";
import { RocketTheme } from "./RocketTheme"



export class ProductService {
}

ProductService.getProduct = function (handle) {
  return RocketTheme.globals.dataStore.productsInCart.find(element => element.product.handle === handle);
}

ProductService.hasTag = function (handle, tag) {
  let productObj = ProductService.getProduct(handle);
  return productObj.product.tags.includes(tag) || productObj.product.tags.includes(tag.toLowerCase());
}

ProductService.isFireworkProduct = function (handle) {
  return ProductService.hasTag(handle, TAG_FW) || ProductService.hasTag(handle, TAG_FWSEQ);
}

ProductService.getVariantID = function (product) {
  return product.product.variants[0].id;
}
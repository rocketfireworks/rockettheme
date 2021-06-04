import {LoadJSONTask} from '../utils/LoadJSONTask.js';
import {COMPLETE, FAIL, POST} from '../utils/constants.js';
import {LoadError} from '../utils/LoadError.js';
import {fatal} from '../utils/logfunctions.js';
import { notNil } from '../utils/utils.js';

export class ShopifyCart {
}

ShopifyCart.getCartTask = function () {
  let getCartTask = ShopifyCart.getLoadJSONTask('/cart.js', 'GET');
  getCartTask.name = 'GET CART';
  return getCartTask;
}

ShopifyCart.getProductTask = function (productURL) {
  let getProductTask = ShopifyCart.getLoadJSONTask( productURL, 'GET');
  getProductTask.name = `GET PRODUCT: ${productURL}`;
  return getProductTask;
}

ShopifyCart.getAddToCartTask = function (variantID) {
  let bodyData = {
    'items': [{
      'id': variantID,
      'quantity': 1
    }]
  };
  let url = '/cart/add.js';

  return ShopifyCart.getLoadJSONTask(url, 'POST', bodyData);
}

ShopifyCart.getRemoveFromCartTask = function (variantID) {
  let removeFromCartTask = ShopifyCart.getUpdateCartTask(variantID,0);
  removeFromCartTask.name = 'REMOVE FROM CART';
  return removeFromCartTask;
}

ShopifyCart.getUpdateCartTask = function (variantID, quantity) {
  let bodyData = {};
  bodyData.updates = {};
  bodyData.updates[variantID] = quantity;
  let url = '/cart/update.js';

  let updateItemTask = ShopifyCart.getLoadJSONTask(url, 'POST', bodyData);

  updateItemTask.on(COMPLETE, () => {
    return updateItemTask.json;
  });

  return updateItemTask;
}

ShopifyCart.getLoadJSONTask = function (url, method, bodyData = null) {
  let loadJSONTaskParams = {
      headersObj: {
        'Content-Type': 'application/json',
        'Accept': 'application/json, text/javascript'
      },
      method: method
    };
  if (notNil(bodyData)) {
    loadJSONTaskParams.body = JSON.stringify(bodyData);
  }

  let loadJSONTask = new LoadJSONTask(url, loadJSONTaskParams);

  loadJSONTask.on(COMPLETE, () => {
    // Task complete
  });

  loadJSONTask.on(FAIL, (e) => {
    // Data failed to load
    let error = e.detail.error;
    if (error instanceof LoadError) {
      if (error.HTTPStatus === 404) {
        fatal(`Not found. URI: ${error.uri}`);
      } else {
        fatal(`Error. HTTP status ${error.HTTPStatus}. URI: ${error.uri}`);
      }
    } else {
      fatal('Failed to load JSON. Either the Internet connection is unavailable '
        +'or an error occurred retrieving the data.');
    }
  });

  return loadJSONTask;
}

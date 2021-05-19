import {LoadJSONTask} from '../utils/LoadJSONTask.js';
import {COMPLETE, FAIL, POST} from '../utils/constants.js';
import {LoadError} from '../utils/LoadError.js';
import {fatal} from '../utils/logfunctions.js';

export class ShopifyCart {
}

ShopifyCart.getAddToCartTask = function (variantID) {
  let bodyData = {
    'items': [{
      'id': variantID,
      'quantity': 1
    }]
  };
  let url = '/cart/add.js';

  return this.getLoadJSONTask(url, bodyData);
}

ShopifyCart.getRemoveFromCartTask = function (variantID) {
  return this.getUpdateCartTask(variantID, 0);
}

ShopifyCart.getUpdateCartTask = function (variantID, quantity) {
  let bodyData = {};
  bodyData.updates = {};
  bodyData.updates[variantID] = quantity;
  let url = '/cart/update.js';

  return this.getLoadJSONTask(url, bodyData);
}

ShopifyCart.getLoadJSONTask = function (url, bodyData) {
  let loadJSONTask = new LoadJSONTask(url,
    {
      headersObj: {
        'Content-Type': 'application/json'
      },
      method: POST,
      body: JSON.stringify(bodyData)
    });

  loadJSONTask.on(COMPLETE, () => {
    console.log('Task complete!');
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

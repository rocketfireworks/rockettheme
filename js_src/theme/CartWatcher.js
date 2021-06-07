import {RocketTheme} from './RocketTheme.js';
import {UpdateCartInDataStoreTask} from './UpdateCartInDataStoreTask.js';
import {UpdateCartProductsInDataStoreTask} from './UpdateCartProductsInDataStoreTask.js';
import {UpdateFireworksTotalInDataStoreTask} from './UpdateFireworksTotalInDataStoreTask.js';
import {TaskManager} from '../utils/TaskManager.js';
import {COMPLETE, FAIL} from '../utils/constants.js';
import {log} from '../utils/logfunctions.js';
import {FIREWORKS_TOTAL_IN_CART_UPDATED, SHOPIFY_CART_UPDATE, UPDATE} from './events.js';
import {EventDispatcher} from '../utils/EventDispatcher.js';
import {LocalCartRefresher} from './LocalCartRefresher.js';

/**
 * Listens for updates to the cart reported by the Shopify SDK, and updates the RocketTheme
 * DataStore's local state in response.
 */
export class CartWatcher extends EventDispatcher {

  constructor (shopifySDKAdapter) {
    super();
    this.refreshInProgress = false;
    this.shopifySDKAdapter = shopifySDKAdapter;
    this.shopifySDKAdapter.on(SHOPIFY_CART_UPDATE, this.shopifyCartUpdateListener.bind(this));
  }

  /**
   * Handles updates to the cart reported by the Shopify SDK (i.e., Shopify.onCartUpdate()).
   * When the Shopify SDK reports a change in the cart, refresh the local cart (i.e., the DataStore).
   * retrieve the cart from the server,
   * then retrieve all products from the server, then update the total price of fireworks
   * in cart.
   */
  shopifyCartUpdateListener () {
    console.log('CartWatcher detected cart change (from Shopify SDK\'s Shopify.onCartUpdate())');
    this.refresh();
  }

  /**
   * Handles updates to the cart reported by the Shopify SDK (i.e., Shopify.onCartUpdate()).
   * When the Shopify SDK reports a change in the cart, refresh the local cart (i.e., the DataStore).
   * retrieve the cart from the server,
   * then retrieve all products from the server, then update the total price of fireworks
   * in cart.
   */
  refresh () {
    if (this.refreshInProgress) {
      console.error('############################################################################')
      console.error('############################################################################')
      console.error('############################################################################')
      console.error('##########################  REFRESH ALREADY IN PROGRESS ####################')
      console.error('############################################################################')
      console.error('############################################################################')
      console.error('############################################################################')
      console.error('================ BUFFERING REFRESH REQUEST... =============');
      // A refresh is already in progress, so a new refresh can't be executed yet. Wait for the
      // current refresh to complete, then execute the requested refresh. (Executing more than one
      // refresh at a time would cause the cart's local state to become scrambled, with the
      // potential for dataStore.fireworksTotalInCart to contain a different set of products than
      // those in dataStore.productsInCart.
      this.refreshBuffered = true;
      return;
    }
    this.refreshInProgress = true;

    let previousFireworksTotal = RocketTheme.globals.dataStore.fireworksTotalInCart;

    // Execute tasks
    this.updateCartTaskManager = new LocalCartRefresher();
    this.updateCartTaskManager.on(COMPLETE, e => {
      this.refreshInProgress = false;
      log('Update Cart Manager finished updating the cart.');
      log('Current Fireworks total in cart: ' + RocketTheme.globals.dataStore.fireworksTotalInCart);
      if (previousFireworksTotal !== RocketTheme.globals.dataStore.fireworksTotalInCart) {
        this.dispatchEvent(FIREWORKS_TOTAL_IN_CART_UPDATED);
      } else {
        console.log('Fireworks total in cart has not changed.');
      }
      this.dispatchEvent(UPDATE);
      if (this.refreshBuffered) {
        console.error('================ EXECUTING BUFFERED REFRESH NOW... =============');
        // A refresh was requested while the current refresh was already in progress. Now that the
        // current refresh has been allowed to complete, execute the refresh that was previously
        // requested.
        this.refreshBuffered = false;
        this.refresh();
      }
    });
    this.updateCartTaskManager.on(FAIL, e => {
      this.refreshInProgress = false;
      log('Update Cart Manager failed to update cart.');
    });

    this.updateCartTaskManager.start();
  }

}
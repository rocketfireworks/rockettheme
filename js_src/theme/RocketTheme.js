/**
 * Main application entry point.
 */
import {BonusRewards} from './BonusRewards.js';
import {log} from '../utils/logfunctions.js';
import {Logger} from '../utils/Logger.js';
import {ConsoleLogger} from '../utils/ConsoleLogger.js';
import {ReleaseInfo} from '../utils/ReleaseInfo.js';
import { DataStore } from './DataStore.js';
import { BonusRewardsProgressView } from './BonusRewardsProgressView.js';
import { notNil } from '../utils/utils.js';

export class RocketTheme {
  boot () {
    // Create logger first so all other code in the application can access it
    RocketTheme.globals.logger = Logger.logger();
    this.consoleLogger = new ConsoleLogger(RocketTheme.globals.logger);

    RocketTheme.globals.dataStore = new DataStore;

    // Create Bonus Rewards manager
    this.bonusRewards = new BonusRewards();
    this.bonusRewardsProgressView = new BonusRewardsProgressView(this.bonusRewards);

    RocketTheme.globals.releaseInfo = new ReleaseInfo('<@APP_TITLE@>', '<@BUILD_VERSION@>', '<@BUILD_DATE@>');

    log(`RocketTheme ${RocketTheme.globals.releaseInfo.title} ${RocketTheme.globals.releaseInfo.version} boot complete.`);
    log(`Last compiled: ${RocketTheme.globals.releaseInfo.date}`);
    let shopifyIntervalId = setInterval(() => {
      console.log("* Waiting for Shopify API");
      if (notNil(Shopify)) {
        if (notNil(Shopify.onCartUpdate)) {
          clearInterval(shopifyIntervalId);
          let originalShopifyOnCartUpdate = Shopify.onCartUpdate;
          console.log("* Replacing Shopify onCartUpdate function");
          Shopify.onCartUpdate = (cart, form) => {
            originalShopifyOnCartUpdate(cart, form);
            console.log('* Shopify.onCartUpdate now invoking bonusRewards.updateCartData');
            this.bonusRewards.updateCartData();
          }
          console.log('* Interval function now invoking bonusRewards.initCartBonus');
          this.bonusRewards.updateCartData();
        }
      }
    }, 500);
  }
}

RocketTheme.globals = {};





















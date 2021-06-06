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
import {WaitForShopifySDKTask} from './WaitForShopifySDKTask.js';
import {TaskManager} from '../utils/TaskManager.js';
import {WaitForSellyTask} from './WaitForSellyTask.js';
import {ShopifySDKAdapter} from '../shopify/ShopifySDKAdapter.js';
import {COMPLETE} from '../utils/constants.js';
import {CartWatcher} from './CartWatcher.js';

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

    let bootManager = RocketTheme.globals.bootManager = new TaskManager('Boot');
    let bootTasks = [new WaitForShopifySDKTask,
      new WaitForSellyTask()];
    bootManager.addTasks(bootTasks);
    bootManager.start();

    bootManager.on(COMPLETE, () => {
      this.shopifySDKAdapter = new ShopifySDKAdapter();
      this.cartWatcher = new CartWatcher(this.shopifySDKAdapter);
    });
  }
}

RocketTheme.globals = {};





















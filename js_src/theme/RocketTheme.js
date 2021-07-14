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
import {InitShopifySDKAdapter} from './InitShopifySDKAdapter.js';
import {InitCartWatcherTask} from './InitCartWatcherTask.js';
import {COMPLETE} from '../utils/constants.js';
import { CartTotalManager } from './CartTotalManager.js';
import { QuickCartSubtotalVerifier } from './QuickCartSubtotalVerifier.js';
import { SellyAdapter } from '../appapis/SellyAdapter.js';
import { SellyDiscountOnProductView } from './SellyDiscountOnProductView.js';

export class RocketTheme {
  boot () {
    // Create logger first so all other code in the application can access it
    RocketTheme.globals.logger = Logger.logger();
    this.consoleLogger = new ConsoleLogger(RocketTheme.globals.logger);

    RocketTheme.globals.dataStore = new DataStore;
    RocketTheme.globals.cartWatcher = null;
    RocketTheme.globals.shopifySDKAdapter = null;

    // Create Bonus Rewards manager
    this.bonusRewards = new BonusRewards();
    this.bonusRewardsProgressView = new BonusRewardsProgressView(this.bonusRewards);

    RocketTheme.globals.releaseInfo = new ReleaseInfo('<@APP_TITLE@>', '<@BUILD_VERSION@>', '<@BUILD_DATE@>');

    log(`RocketTheme ${RocketTheme.globals.releaseInfo.title} ${RocketTheme.globals.releaseInfo.version} boot complete.`);
    log(`Last compiled: ${RocketTheme.globals.releaseInfo.date}`);

    let bootManager = RocketTheme.globals.bootManager = new TaskManager('Boot');
    let bootTasks = [new WaitForShopifySDKTask,
      new WaitForSellyTask(),
      new SellyAdapter(),
      new InitShopifySDKAdapter(),
      new InitCartWatcherTask()
    ];
    bootManager.addTasks(bootTasks);
    bootManager.on(COMPLETE, () => {
      console.log('######################### BOOT DONE')
      this.bonusRewards.setCartWatcher(RocketTheme.globals.cartWatcher);
      this.bonusRewards.refresh();
      this.bonusRewardsProgressView.setCartWatcher(RocketTheme.globals.cartWatcher);

      this.cartTotalManager = new CartTotalManager(RocketTheme.globals.dataStore);
      this.quickCartSubtotalVerifier = new QuickCartSubtotalVerifier(this.cartTotalManager);

      // Output Selly discount
      this.sellyDiscountOnProductView = new SellyDiscountOnProductView();
      this.sellyDiscountOnProductView.setCartWatcher(RocketTheme.globals.cartWatcher);

    });
    bootManager.start();
  }

}

RocketTheme.globals = {};





















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

export class RocketTheme {
  boot () {
    // Create logger first so all other code in the application can access it
    RocketTheme.globals.logger = Logger.logger();
    this.consoleLogger = new ConsoleLogger(RocketTheme.globals.logger);

    RocketTheme.globals.dataStore = new DataStore;

    this.shopifySDKAdapter = null;
    this.cartWatcher = null;

    // Create Bonus Rewards manager
    this.bonusRewards = new BonusRewards();
    this.bonusRewardsProgressView = new BonusRewardsProgressView(this.bonusRewards);

    RocketTheme.globals.releaseInfo = new ReleaseInfo('<@APP_TITLE@>', '<@BUILD_VERSION@>', '<@BUILD_DATE@>');

    log(`RocketTheme ${RocketTheme.globals.releaseInfo.title} ${RocketTheme.globals.releaseInfo.version} boot complete.`);
    log(`Last compiled: ${RocketTheme.globals.releaseInfo.date}`);

    let bootManager = RocketTheme.globals.bootManager = new TaskManager('Boot');
    let bootTasks = [new WaitForShopifySDKTask,
      new WaitForSellyTask(),
      new InitShopifySDKAdapter(this),
      new InitCartWatcherTask(this)
    ];
    bootManager.addTasks(bootTasks);
    bootManager.on(COMPLETE, () => {
      console.log('######################### BOOT DONE')
      this.bonusRewards.setCartWatcher(this.cartWatcher);
      this.bonusRewards.refresh();
      this.bonusRewardsProgressView.setCartWatcher(this.cartWatcher);
    });
    bootManager.start();
  }

}

RocketTheme.globals = {};





















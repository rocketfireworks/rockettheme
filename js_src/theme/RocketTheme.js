/**
 * Main application entry point.
 */
import {BonusRewards} from './BonusRewards.js';
import {log} from '../utils/logfunctions.js';
import {Logger} from '../utils/Logger.js';
import {ConsoleLogger} from '../utils/ConsoleLogger.js';
import {ReleaseInfo} from '../utils/ReleaseInfo.js';
import { DataStore } from './DataStore.js';

export class RocketTheme {
  boot () {
    // Create logger first so all other code in the application can access it
    RocketTheme.globals.logger = Logger.logger();
    this.consoleLogger = new ConsoleLogger(RocketTheme.globals.logger);

    RocketTheme.globals.dataStore = new DataStore;

    // Create Bonus Rewards manager
    this.bonusRewards = new BonusRewards();

    RocketTheme.globals.releaseInfo = new ReleaseInfo('<@APP_TITLE@>', '<@BUILD_VERSION@>', '<@BUILD_DATE@>');

    log(`RocketTheme ${RocketTheme.globals.releaseInfo.title} ${RocketTheme.globals.releaseInfo.version} boot complete.`);
    log(`Last compiled: ${RocketTheme.globals.releaseInfo.date}`);
  }
}

RocketTheme.globals = {};





















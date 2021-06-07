import {Task} from '../utils/Task.js';
import {UPDATE} from './events.js';

export class RefreshCartWatcherTask extends Task {
  constructor (cartWatcher) {
    super();
    this.name = 'REFRESH CART WATCHER';
    this.cartWatcher = cartWatcher;
    this.waitForCartWatcherIntervalID = -1;
  }

  start () {
    super.start();
    // If there's a refresh() in progress, wait for that to complete before requesting a new one.
    if (this.cartWatcher.refreshInProgress) {
      this.waitForCartWatcherIntervalID = setInterval(() => {
        if (!this.cartWatcher.refreshInProgress) {
          clearInterval(this.waitForCartWatcherIntervalID);
          this.waitForCartWatcherIntervalID = -1;
          this.requestRefresh();
        }
      }, 500);
    } else {
      this.requestRefresh();
    }
  }

  requestRefresh () {
    this.boundUpdateListener = this.cartWatcherUpdateListener.bind(this);
    this.cartWatcher.on(UPDATE, this.boundUpdateListener);
    this.cartWatcher.refresh();
  }

  cartWatcherUpdateListener () {
    // CartWatcher has been created and finished its first refresh, so the init task is done
    this.cartWatcher.off(UPDATE, this.boundUpdateListener);
    this.done();
  }
}

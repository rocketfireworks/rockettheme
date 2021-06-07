import {Task} from '../utils/Task.js';
import {CartWatcher} from './CartWatcher.js';
import {UPDATE} from './events.js';
import {RocketTheme} from './RocketTheme.js';


export class InitCartWatcherTask extends Task {
  constructor () {
    super();
    this.name = 'INIT CART WATCHER';
  }

  start () {
    super.start();
    RocketTheme.globals.cartWatcher = new CartWatcher(RocketTheme.globals.shopifySDKAdapter);

    this.boundUpdateListener = this.cartWatcherUpdateListener.bind(this);
    RocketTheme.globals.cartWatcher.on(UPDATE, this.boundUpdateListener);
    RocketTheme.globals.cartWatcher.refresh();
  }

  cartWatcherUpdateListener () {
    // CartWatcher has been created and finished its first refresh, so the init task is done
    RocketTheme.globals.cartWatcher.off(UPDATE, this.boundUpdateListener);
    this.done();
  }
}

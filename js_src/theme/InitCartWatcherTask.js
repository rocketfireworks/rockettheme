import {Task} from '../utils/Task.js';
import {CartWatcher} from './CartWatcher.js';
import {UPDATE} from './events.js';


export class InitCartWatcherTask extends Task {
  constructor (rocketTheme) {
    super();
    this.name = 'INIT CART WATCHER';
    this.rocketTheme = rocketTheme;
  }

  start () {
    super.start();
    this.rocketTheme.cartWatcher = new CartWatcher(this.rocketTheme.shopifySDKAdapter);
    this.rocketTheme.cartWatcher.on(UPDATE, () => {
      // CartWatcher has been created and finished its first refresh, so the init task is done
      this.done();
    });
    this.rocketTheme.cartWatcher.refresh();
  }
}

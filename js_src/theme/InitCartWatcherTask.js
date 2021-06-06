import {Task} from '../utils/Task.js';
import {CartWatcher} from './CartWatcher.js';


export class InitCartWatcherTask extends Task {
  constructor (rocketTheme) {
    super();
    this.name = 'INIT CART WATCHER';
    this.rocketTheme = rocketTheme;
  }

  start () {
    super.start();
    this.rocketTheme.cartWatcher = new CartWatcher(this.rocketTheme.shopifySDKAdapter);
    this.done();
  }
}

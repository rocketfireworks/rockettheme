import { SellyService } from '../appapis/SellyService.js';
import {Task} from '../utils/Task.js';
import { notNil } from '../utils/utils.js';


export class WaitForSellyTask extends Task {
  constructor () {
    super();
    this.name = "WAIT FOR SELLY";
  }

  start () {
    super.start();

    this.checkSelly();

    if (!this.complete) {
      this.checkSellyIntervalID = setInterval(() => {
        this.checkSelly();
        if (this.complete) {
          clearInterval(this.checkSellyIntervalID);
        }
      }, 200);
    }
  }

  checkSelly () {
    if (notNil(window.sellyData)) {
      SellyService.data = window.sellyData;
      this.done();
    }
  }
}

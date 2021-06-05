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

    console.log('* Waiting for Selly');
    this.checkSelly();
    console.log('* Wait for Selly task complete?', this.complete);

    if (!this.complete) {
      this.checkSellyIntervalID = setInterval(() => {
        console.log('* Checking if Selly has loaded from inside interval');
        this.checkSelly();
        if (this.complete) {
          console.log('* Selly has loaded, so clear interval...');
          clearInterval(this.checkSellyIntervalID);
        }
      }, 200);
    }
  }

  checkSelly () {
    if (notNil(window.sellyData)) {
      SellyService.data = window.sellyData;
      console.log('* Selly loaded');
      this.done();
    } else {
      console.log('* Selly not loaded');
    }
  }
}

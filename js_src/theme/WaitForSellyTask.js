import {Task} from '../utils/Task.js';


export class WaitForSellyTask extends Task {
  constructor () {
    super();
    this.name = "WAIT FOR SELLY";
  }

  start () {
    super.start();

    this.checkSellyIntervalID = setInterval(() => {
      if (this.checkSelly()) {
        this.done();
        clearInterval(this.checkSellyIntervalID);
      }
    }, 1000);
  }

  checkSelly () {
    return true;
  }
}

import {notNil} from "./utils.js";

/**
 * Dispatches events for plain JavaScript objects.
 *
 * To access the dispatching object from an Event object, use e.detail.target.
 */
export class EventDispatcher {
  constructor () {
    this.proxyElement = document.createTextNode('');
    this.off = this.proxyElement.removeEventListener.bind(this.proxyElement);
    this.on = this.proxyElement.addEventListener.bind(this.proxyElement);
  }

  dispatchEvent (eventName, data = {}) {
    if (notNil(eventName)) {
      let e = new CustomEvent(eventName, {'detail':data});
      if (!data.hasOwnProperty('target')) {
        data.target = this;
      }
      this.proxyElement.dispatchEvent(e);
    }
  }
}

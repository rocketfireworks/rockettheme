import {Task} from './Task.js';
import {LoadError} from './LoadError.js';
import {isRelativeURL, notEmpty} from './utils.js';
import {GET} from './constants.js';

/**
 * A generic HTTP load task. If the HTTP request completes with response status 200-299, LoadTask
 * dispatches COMPLETE. Otherwise, LoadTask dispatches FAIL, with either LoadError (for HTTP failures
 * such as 404, 503, etc), or Error (for generic failures such as no internet or permission denied).
 */
export class LoadTask extends Task {
  /**
   * LoadTask constructor function.
   *
   * @param url The URL to load. If the URL is relative, the full path is resolved relative to the
   *            document.baseURI.
   * @param headersObj The HTTP headers for the request, as key/value pairs on a plain JavaScript object.
   * @param nocache If true, LoadTask will append a query string to attempt to prevent the requested
   *                resource from being cached by the browser.
   * @param params Query string parameters for the request, as a generic JavaScript object whose
   *               properties are the key/value query-string pairs.
   * @param method The HTTP method (e.g., GET, DELETE, POST).
   * @param body The request body (does not apply to GET requests).
   */
  constructor (url, {headersObj = null, nocache = false, params = {}, method = GET, body = null} = {}) {
    super();
    this.name = 'LOAD';
    this.url = url;
    this.headers = headersObj;
    this.nocache = nocache;
    this.params = params;
    this.method = method;
    this.body = body;
  }

  start () {
    super.start();

    // Create the URL object. If the supplied URL is a relative URL, automatically include the
    // required base URL string.
    let url;
    if (isRelativeURL(this.url)) {
      url = new URL(this.url, document.baseURI);
    } else {
      url = new URL(this.url);
    }

    if (this.nocache === true) {
      this.params.nocache = new Date().getTime().toString();
    }

    // Assign query params to url object
    Object.keys(this.params).forEach(key => url.searchParams.append(key, this.params[key]))

    // Create fetch() init object
    let fetchInit = {};
    if (notEmpty(this.headers)) {
      fetchInit.headers = this.headers;
    }
    if (notEmpty(this.method)) {
      fetchInit.method = this.method;
    }
    // body is not allowed with GET requests, and will trigger an error if present, so don't add
    // body to fetchInit if the method request is GET, even if body has a value.
    if (notEmpty(this.body) && this.method !== GET) {
      fetchInit.body = this.body;
    }

    // Start network request
    fetch(url, fetchInit).then(response => {
      // The fetch() Promise was fulfilled, but the HTTP request itself might have returned a failure
      // such as 404. When a fetch() request yields a 404 response, response.ok will be false.
      this.response = response;
      if (response.ok) {
        this.handleSuccess(response);
      } else {
        // The HTTP request failed.
        this.fail(new LoadError(response.status, response.url));
      }
    })
    .catch(error => {
      this.fail(new Error('Load failed. Possible causes: No internet available or permission denied.'));
    });
  }

  handleSuccess (response) {
    this.done();
  }
}

import {LoadTask} from './LoadTask.js';
import {GET} from './constants.js';

/**
 * Loads the JSON at the specified endpoint. If the load is successful, the loaded JSON can be
 * accessed via the LoadJSONTask object's .json property.
 *
 * Example with HTTP Authorization header:
 * let loadJSONTask = new LoadJSONTask(connectionConfigurationsURL,
 *   {
 *     headersObj:
 *       {
 *         'Authorization':
 *         `Token token=${someSessionToken}`
 *       }
 *   });
 * loadJSONTask.on(COMPLETE, () => {
 *   SomeApp.globals.dataStore.megaphoneToken = get(loadJSONTask.json, 'megaphone_token');
 * });
 *
 * loadJSONTask.on(FAIL, (e) => {
 *   // Data failed to load
 *   let error = e.detail.error;
 *   if (error instanceof LoadError) {
 *     if (error.HTTPStatus === 404) {
 *       fatal(`Not found. URI: ${error.uri}`);
 *     } else {
 *       fatal(`Error. HTTP status ${error.HTTPStatus}. URI: ${error.uri}`);
 *     }
 *   } else {
 *     fatal('Failed to load JSON. Either the Internet connection is unavailable '
 *           + 'or an error occurred retrieving the data.');
 *   }
 * });
 *
 * loadJSONTask.start();
 */
export class LoadJSONTask extends LoadTask {
  constructor (url, {headersObj = null, nocache = false, params = {}, method = GET, body = null} = {}) {
    super(url,  {headersObj: headersObj, nocache: nocache, params: params, method: method, body: body});
    this.name = 'LOAD_JSON';
    this.json = null;
  }

  handleSuccess (response) {
    response.json().then(json => {
      this.json = json;
      this.done();
    });
  }
}

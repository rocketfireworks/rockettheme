/**
 * A load error triggered by a failed HTTP request. Used by fetch() Promise handlers to branch
 * between various types of load failures.
 */
export class LoadError extends Error {
  constructor(HTTPStatus, uri, ...params) {
    // Pass remaining arguments (including vendor specific ones) to parent constructor
    super(...params);

    // Maintains proper stack trace for where our error was thrown (only available on V8).
    // See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, LoadError);
    }

    this.name = 'LoadError';
    // The HTTP response status for the failure (e.g., 400, 403, 503)
    this.HTTPStatus = HTTPStatus;
    // The original URI requested
    this.uri = uri;
  }
}

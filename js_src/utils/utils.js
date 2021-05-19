/**
 * Indicates whether a value exists and can be operated on. This function is provides a standardized
 * mechanism for writing code that avoids triggering reference errors.
 */
export function isNil (value) {
  // null, undefined, and NaN are blank
  return value === null || value === undefined || Number.isNaN(value);
}

export function notNil (value) {
  return !isNil(value);
}

/**
 * Returns true if value is any of the following:
 * null
 * undefined
 * NaN
 * empty string
 * empty array
 * empty Map
 * empty Set
 * object with no properties
 */
export function isEmpty (value) {
  if (isNil(value)) {
    return true;
  } else {
    if (typeof value === 'string' || value instanceof Array) {
      return value.length === 0;
    }
    if (value instanceof Set || value instanceof Map) {
      return value.size === 0;
    }
    if (typeof value === 'object') {
      return Object.keys(value).length === 0;
    }
  }
  return false;
}

export function notEmpty (value) {
  return !isEmpty(value);
}

/**
 * Returns true if the supplied url (string) is a relative URL such as "../config.json". Otherwise,
 * if the supplied url is an absolute URL such as "http://example.com/config.json", returns false.
 * This function requires a browser-supplied document object or equivalent.
 *
 * @param url A string URL.
 * @returns {boolean}
 */
export function isRelativeURL (url) {
  return new URL(document.baseURI).origin === new URL(url, document.baseURI).origin;
}

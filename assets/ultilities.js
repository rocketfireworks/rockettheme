//========================
// BEGIN UTILS
//========================  
  
/**
 * Wrapper that must surround every Liquid custom field reference that is accessed
 * via JavaScript. When the field is empty, returns null.
 */ 
function field (value) {
  return isEmpty(value) ? null : value;    
}
  
function getIfNotEmpty (object, path, defaultValue = null) {
  let value = _.get(object, path);
  return isEmpty(value) ? defaultValue : value;
}
                    
function notNil (value) {
  return !isNil(value);
}


function isNil (value) {
  // null, undefined, and NaN are blank
  return value === null || value === undefined || Number.isNaN(value);
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
 */
function isEmpty (value) {
  if (isNil(value)) {
    return true;
  } else {
    if (typeof value === 'string' || value instanceof Array) {
      return value.length === 0;
    }
    if (value instanceof Set || value instanceof Map) {
      return value.size === 0;
    }
  }
  return false;
}

function notEmpty (value) {
  return !isEmpty(value);
}
                  
//========================
// END UTILS
//========================
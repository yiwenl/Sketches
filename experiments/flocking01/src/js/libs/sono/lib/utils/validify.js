'use strict';

module.exports = Object.freeze({
  number: function(value, defaultValue) {
    if(arguments.length < 2) { defaultValue = 0; }
    if(typeof value !== 'number' || isNaN(value)) { return defaultValue; }
    return value;
  }
});

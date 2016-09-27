'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
/**
 * Logs a deprecation message if not in production
 */
var deprecated = function deprecated(msg) {
  if (process.env.NODE_ENV !== 'production') {
    console.warn('Deprecation warning: redraft - ' + msg + ' reffer to: https://github.com/lokiuz/redraft/blob/master/README.md'); // eslint-disable-line
  }
};

exports.default = deprecated;
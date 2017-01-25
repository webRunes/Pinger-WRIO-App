'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _path = require('path');

var _path2 = _interopRequireDefault(_path);

var _nconf = require('nconf');

var _nconf2 = _interopRequireDefault(_nconf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_nconf2.default.env().argv();

var basedirPath = _path2.default.dirname(require.main.filename); // won't work with unit tests
_nconf2.default.file(_path2.default.resolve(__dirname, '../config.json'));

exports.default = _nconf2.default;
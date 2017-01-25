'use strict';

var _nodeTwitterApi = require('node-twitter-api');

var _nodeTwitterApi2 = _interopRequireDefault(_nodeTwitterApi);

var _wrio_nconf = require('../wrio_nconf.js');

var _wrio_nconf2 = _interopRequireDefault(_wrio_nconf);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

module.exports.Client = function (creds) {
    creds = creds || {};
    var twitter = new _nodeTwitterApi2.default({
        consumerKey: creds.consumer_key,
        consumerSecret: creds.consumer_secret,
        callback: creds.callback
    });
    return twitter;
};

module.exports.AuthClient = function () {
    var twitter = new _nodeTwitterApi2.default({
        consumerKey: _wrio_nconf2.default.get('api:twitterLogin:consumerKey'),
        consumerSecret: _wrio_nconf2.default.get('api:twitterLogin:consumerSecret')
    });
    return twitter;
};

module.exports._Client = function (creds) {
    var creds = creds || {},
        twitter = new _nodeTwitterApi2.default({
        consumerKey: creds.consumer_key,
        consumerSecret: creds.consumer_secret,
        callback: creds._callback
    });
    return twitter;
};
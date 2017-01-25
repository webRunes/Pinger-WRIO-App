"use strict";

var _wrio_nconf = require("./wrio_nconf.js");

var _wrio_nconf2 = _interopRequireDefault(_wrio_nconf);

var _twitterClient = require("./utils/twitter-client");

var _twitterClient2 = _interopRequireDefault(_twitterClient);

var _es6Promisify = require("es6-promisify");

var _es6Promisify2 = _interopRequireDefault(_es6Promisify);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var titterSender = {};
titterSender.comment = function (cred, message, imagePath, done) {
    var twitterClient = new Twitter.RestClient(_wrio_nconf2.default.get('api:twitterLogin:consumerKey'), _wrio_nconf2.default.get('api:twitterLogin:consumerSecret'), cred.token, cred.tokenSecret);

    twitterClient.statusesUpdateWithMedia({
        'status': message,
        'media[]': imagePath
    }, function (error, result) {
        if (error) {
            var err = 'Titter-sender error: ' + (error.code ? error.code + ' ' + error.message : error.message);
            console.log(err);
            done(err);
        }
        if (result) {
            console.log(result);
            done(null, result);
        }
    });
};

titterSender.upload = function (creds, file, cb) {

    var twitter = _twitterClient2.default.AuthClient();
    console.log("Upload media called!");
    var params = {
        media: file
    };
    console.log(params, creds);
    twitter.uploadMedia(params, creds.token, creds.tokenSecret, function (err, data) {
        if (err) {
            console.log('Upload error:', err);
            cb(err);
        } else {
            console.log("Upload result", data);
            cb(!1, data);
        }
    });
};

titterSender.reply = function (creds, message, files, cb) {
    var twitter = _twitterClient2.default.Client({
        consumer_key: _wrio_nconf2.default.get('api:twitterLogin:consumerKey'),
        consumer_secret: _wrio_nconf2.default.get('api:twitterLogin:consumerSecret')
    }),
        params = {
        status: message,
        media_ids: files.length === 1 ? files[0] : files.join(',')
    };
    console.log(params);
    twitter.statuses('update', params, creds.token, creds.tokenSecret, function (err, data, res) {
        if (err) {
            console.log('Reply error:', err);
            cb(err);
        } else {
            cb(!1, !0);
            console.log('Reply ok!');
        }
    });
};

titterSender.uploadP = (0, _es6Promisify2.default)(titterSender.upload);
titterSender.replyP = (0, _es6Promisify2.default)(titterSender.reply);

module.exports = titterSender;
const Twitter = require('node-twitter-api');
const nconf = require('../wrio_nconf.js');

module.exports.Client = function(creds) {
    creds = creds || {};
    var twitter = new Twitter({
        consumerKey: creds.consumer_key,
        consumerSecret: creds.consumer_secret,
        callback: creds.callback
    });
    return twitter;
};

module.exports.AuthClient = function() {
    var twitter = new Twitter({
        consumerKey:nconf.get('api:twitterLogin:consumerKey'),
        consumerSecret: nconf.get('api:twitterLogin:consumerSecret')
    });
    return twitter;
};


module.exports._Client = function(creds) {
    var creds = creds || {},
        twitter = new Twitter({
            consumerKey: creds.consumer_key,
            consumerSecret: creds.consumer_secret,
            callback: creds._callback
        });
    return twitter;
};

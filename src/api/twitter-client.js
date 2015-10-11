var Twitter = require('node-twitter');

module.exports.SearchClient = function(creds) {
    return new Twitter.SearchClient(
        creds.consumer_key,
        creds.consumer_secret,
        creds.access_token,
        creds.access_token_secret
    );
}

module.exports.RestClient = function(creds) {
    return new Twitter.RestClient(
        creds.consumer_key,
        creds.consumer_secret,
        creds.access_token,
        creds.access_token_secret
    );
}
    
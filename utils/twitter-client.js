var Twitter = require('node-twitter-api');

module.exports.Client = function(creds) {
	var creds = creds || {},
		twitter = new Twitter({
			consumerKey: creds.consumer_key,
			consumerSecret: creds.consumer_secret,
			callback: creds.callback
		});
	return twitter;
}

module.exports._Client = function(creds) {
	var creds = creds || {},
		twitter = new Twitter({
			consumerKey: creds.consumer_key,
			consumerSecret: creds.consumer_secret,
			callback: creds._callback
		});
	return twitter;
}

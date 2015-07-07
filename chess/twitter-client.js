var Twitter = require('node-twitter-api');

module.exports.Client = function(creds) {
	var twitter = new Twitter({
		consumerKey: creds.consumer_key,
		consumerSecret: creds.consumer_secret,
		callback: creds.callback
	});
	return twitter;
}

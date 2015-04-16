var nconf = require("./wrio_nconf.js").init();
var Twitter = require('node-twitter');

var titterSender = {};
titterSender.comment = function (cred, message, imagePath) {
	var twitterClient = new Twitter.RestClient(
		nconf.get('api:twitterLogin:consumerKey'),
		nconf.get('api:twitterLogin:consumerSecret'),
		cred.token,
		cred.tokenSecret
	)

	twitterClient.statusesUpdateWithMedia(
		{
			'status': message,
			'media[]': imagePath
		},
		function (error, result) {
			if (error) {
				console.log('Error: ' + (error.code ? error.code + ' ' + error.message : error.message));
			}
			if (result) {
				console.log(result);
			}
		});
}

module.exports = titterSender;

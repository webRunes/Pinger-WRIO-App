var nconf = require("./wrio_nconf.js").init();
var Twitter = require('node-twitter');

var titterSender = {};
titterSender.comment = function (cred, message, imagePath, done) {
	var twitterClient = new Twitter.RestClient(
		nconf.get('api:twitterLogin:consumerKey'),
		nconf.get('api:twitterLogin:consumerSecret'),
		cred.token,
		cred.tokenSecret
	);

	twitterClient.statusesUpdateWithMedia(
		{
			'status': message,
			'media[]': imagePath
		},
		function (error, result) {
			if (error) {
				var err = 'Titter-sender error: ' + (error.code ? error.code + ' ' + error.message : error.message)
				console.log(err);
				done(err);
			}
			if (result) {
				console.log(result);
				done(null,result)
			}
		});
}

module.exports = titterSender;

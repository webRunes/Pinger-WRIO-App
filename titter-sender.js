var Twitter = require('node-twitter');
var titterPicture = require('./titter-picture');
var nconf = require("./wrio_nconf.js").init();

var twitterClient = new Twitter.RestClient(
	nconf.get('api:twitterLogin:consumerKey'),
	nconf.get('api:twitterLogin:consumerSecret'),
	nconf.get('api:twitterLogin:token'),
	nconf.get('api:twitterLogin:tokenSecret')
)

var titterSender = {};

titterSender.comment = function (message, imagePath) {
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

var Twitter = require('node-twitter');
var titterPicture = require('./titter-picture');
var nconf = require("./wrio_nconf.js").init();

var twitter = new Twitter.RestClient(
	nconf.get('api:twitter:consumerKey'),
	nconf.get('api:twitter:consumerSecret'),
	nconf.get('api:twitter:token'),
	nconf.get('api:twitter:tokenSecret')
)

var titterSender = {};

titterSender.comment = function (imgSrc, callback) {
	twitter.statusesUpdateWithMedia(
		{
			'status': "",
			'media[]': imgSrc
		},
		callback
	);
}

module.exports = titterSender;

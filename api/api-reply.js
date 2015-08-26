var router = require('express')
	.Router();
var titterPicture = require('../titter-picture');
var titterSender = require('../titter-sender');
var fs = require("fs");
var TwitterClient = require("../utils/twitter-client");

router.post('/reply', function(request, response) {
	var user = request.body.user || '',
		creds = request.body.creds || {},
		message = request.body.message || '',
		access = request.body.access || {},
		_ = request.body._ || !1,
		params = {
			status: message,
			screen_name: user
		},
		twitter = _ ? TwitterClient._Client(creds) : TwitterClient.Client(creds);
	twitter.statuses('update', params, access.accessToken, access.accessTokenSecret, function(err, data, res) {
		if (err) {
			console.log(err);
			return response.status(400)
				.send(err);
		} else {
			response.status(200)
				.end();
		}
	});
});

router.post('/replyAll', function(request, response) {
	var twitterRestClient = new TwitterClient.Client(request.body.twitterCreds);
	var statuses = request.body.statuses;

	if ((!statuses)) {
		response.status(400).send({error:"Missing parameters"});
		return;
	}

	statuses.forEach(function(status) {
		var replyText = '@' + status.user.screen_name + ' ' + request.body.message;

		titterPicture.drawComment(replyText, function(err, filename) {
			if (err) {
				console.log(err);
				return console.log('Draw comment error:', err.message);
			}

			var query = {
				'status': replyText,
				'media[]': filename,
				screen_name: status.user.screen_name,
				in_reply_to_status_id: status.id_str
			}

			twitterRestClient.statusesUpdateWithMedia(query, function(err, result) {
				if (err) {
					console.log(err);
					return response.status(400)
						.send(err);
				}

				response.status(200)
					.end();
			});
		});
	});
});

module.exports = router;

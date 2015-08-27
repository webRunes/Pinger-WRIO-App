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
		media_ids = request.body.media_ids,
		_ = request.body._ || !1,
		params;
	if (media_ids) {
		params = {
			status: message,
			screen_name: user,
			media_ids: media_ids
		}
	} else {
		params = {
			status: message,
			screen_name: user
		}
	}
	twitter = _ ? TwitterClient._Client(creds) : TwitterClient.Client(creds);
	twitter.statuses('update', params, access.accessToken, access.accessTokenSecret, function(err, data, res) {
		if (err) {
			console.log(err)
			return response.status(err.code)
				.send(err.message);
		} else {
			response.status(200)
				.end();
		}
	});
});

router.post('/uploadMedia', function(request, response) {
	var user = request.body.user || '',
		creds = request.body.creds || {},
		message = request.body.message || '',
		access = request.body.access || {},
		filename = request.body.filename || '',
		_ = request.body._ || !1,
		params = {
			media: '../images/' + filename
		},
		twitter = _ ? TwitterClient._Client(creds) : TwitterClient.Client(creds);
	twitter.uploadMedia(params, access.accessToken, access.accessTokenSecret, function(err, data, res) {
		if (err) {
			return response.status(err.code)
				.send(err.message);
		} else {
			response.status(200)
				.json({
					data: data
				});
		}
	});
});

router.post('/replyAll', function(request, response) {
	var twitterRestClient = new TwitterClient.Client(request.body.twitterCreds);
	var statuses = request.body.statuses;

	statuses.forEach(function(status) {
		var replyText = '@' + status.user.screen_name + ' ' + request.body.message;

		titterPicture.drawComment(replyText, function(err, filename) {
			if (err) {
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
					return response.status(err.code)
						.send(err.message);
				}

				response.status(200)
					.end();
			});
		});
	});
});

module.exports = router;

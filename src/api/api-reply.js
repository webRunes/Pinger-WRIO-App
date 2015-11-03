var multer = (require('multer'))();
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
		in_reply_to_status_id = request.body.in_reply_to_status_id,
		_ = request.body._ || !1,
		params;
	if (media_ids) {
		params = {
			status: message,
			screen_name: user,
			media_ids: media_ids,
			in_reply_to_status_id: in_reply_to_status_id
		}
	} else {
		params = {
			status: message,
			screen_name: user
		}
	}
	var twitter = _ ? TwitterClient._Client(creds) : TwitterClient.Client(creds);
	twitter.statuses('update', params, access.accessToken, access.accessTokenSecret, function(err, data, res) {
		if (err) {
			return response.status(400)
				.send(err);
		} else {
			response.status(200)
				.end();
		}
	});
});

router.post('/uploadMedia', multer.single('image'), function(request, response) {
	var body = JSON.parse(request.body.params),
		creds = body.creds || {},
		access = body.access || {},
		params = {
			media: request.file.buffer
		},
		twitter = TwitterClient.Client(creds);
	twitter.uploadMedia(params, access.accessToken, access.accessTokenSecret, function(err, data, res) {
		if (err) {
			return response.status(400)
				.send(err);
		} else {
			response.status(200)
				.json({
					data: data
				});
		}
	});
});

router.post('/drawComment', function(request, response) {
	var creds = request.body.creds || {},
		message = request.body.message || '',
		access = request.body.access || {};
	titterPicture.drawComment(message, function(err, filename) {
		if (err) {
			console.log(err);
			return console.log('Draw comment error:', err.message);
		}
		var params = {
				media: filename
			},
			twitter = TwitterClient.Client(creds);
		twitter.uploadMedia(params, access.accessToken, access.accessTokenSecret, function(err, data, res) {
			if (err) {
				return response.status(400)
					.send(err);
			} else {
				response.status(200)
					.json({
						data: data
					});
			}
		});
	});

});

router.post('/replyAll', function(request, response) {
	var twitterRestClient = new TwitterClient.Client(request.body.twitterCreds);
	var statuses = request.body.statuses;

	if ((!statuses)) {
		response.status(400)
			.send({
				error: "Missing parameters"
			});
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

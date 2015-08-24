var router = require('express')
	.Router();
var TwitterClient = require("../utils/twitter-client");

router.post('/search', function(request, response) {

	var creds = request.body.twitterCreds;
	var twitterSearchClient = TwitterClient.Client(creds);

	twitterSearchClient.search(request.body.query, creds.access_token, creds.access_secret, function(err, data) {
		if (err) {
			return response.status(err.status)
				.send(err.message);
		}

		console.log('Found ' + data.statuses.length + ' statuses');
		if (data.statuses.length > 0) {
			response.status(200)
				.json({
					statuses: data.statuses
				});
		} else {
			response.status(404)
				.send('Nothing found');
		}
	});
});

module.exports = router;

var router = require('express')
	.Router();
var TwitterClient = require("../utils/twitter-client");

router.post('/search', function(request, response) {

	var creds = request.body.twitterCreds;
	var twitterSearchClient = TwitterClient.Client(creds);

	console.log("Got /api/search");

	if ((!creds) || (!request.body.query)) {
		response.status(400).send({error:"Missing parameters"});
		return;
	}

	twitterSearchClient.search(request.body.query, creds.access_token, creds.access_secret, function(err, data) {
		if (err) {
			console.log(err);
			return response.status(400)
				.send(err);
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

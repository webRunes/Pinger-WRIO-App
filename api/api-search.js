var router = require('express').Router();
var TwitterClient = require("./twitter-client");

router.post('/search', function(request, response) {
    
    var twitterSearchClient = TwitterClient.SearchClient(request.body.twitterCreds);
    
    twitterSearchClient.search(request.body.query, function(err, data) {
        if (err) {
            return response.status(err.status).send(err.message);
        }
        
    	console.log('Found ' + data.statuses.length + ' statuses');
    	if (data.statuses.length > 0) {
    	    response.status(200).json({ statuses: data.statuses });
    	} else {
    	    response.status(404).send('Nothing found');
    	}
    });
});

module.exports = router;
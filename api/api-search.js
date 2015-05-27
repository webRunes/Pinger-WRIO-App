var router = require('express').Router();
var Twit = require('twit');

router.post('/search', function(request, response) {
    var T = new Twit(request.body.twitterCreds);
    T.get('search/tweets', request.body.query, function(err, data) {
        if (err) {
            return response.status(402).send(err.message);
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
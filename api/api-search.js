var router = require('express').Router();
var Twit = require('twit');

router.post('/search', function(request, response) {
    var T = new Twit(request.body.twitter_creds);
    T.get('search/tweets', request.body.query, function(err, item) {
        if (err) console.log('Problems with Twitter');
        
    	console.log('Got ' + item.statuses.length + ' statuses');
    	if (item.statuses.length > 0) {
    	    response.status(200).json({ statuses: item.statuses });
    	} else {
    	    response.status(404).send('Nothing found');
    	}
    });
});

module.exports = router;
var router = require('express').Router();
var Twit = require('twit');

router.post('/replyAll', function(request, response){
    var T = new Twit(request.body.twitterCreds);
    var statuses = request.body.statuses;
    
    statuses.forEach(function(status) {
        var replyText = '@' + status.user.screen_name + ' ' + request.body.message
        console.log('Replying to @' + status.user.screen_name + ': ' + replyText);
        var query = {
            status: replyText,
    		screen_name: status.user.screen_name,
    		in_reply_to_status_id: status.id_str
        }
        
        T.post('statuses/update', query, function(err, data) {
    		if (err) {
    			return response.status(402).send(err.message);
    		}
    		
    		console.log('Successfully replied to @' + status.user.screen_name);
    		response.status(200).end();
    	});    
    });
});

module.exports = router;
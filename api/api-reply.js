var router = require('express').Router();
var Twit = require('twit');
var titterPicture = require('../titter-picture');
var titterSender = require('../titter-sender');
var fs = require("fs");
var Twitter = require('node-twitter');


router.post('/replyAll', function(request, response){
    var creds = request.body.twitterCreds
    var twitterRestClient = new Twitter.RestClient(
        creds.consumer_key,
        creds.consumer_secret,
        creds.access_token,
        creds.access_token_secret
    );
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
                        return response.status(err.code).send(err.message);
                    }
            
                    response.status(200).end();
                }
            );
		});
    });
});

module.exports = router;
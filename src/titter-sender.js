import nconf from "./wrio_nconf.js";
import TwitterClient from "./utils/twitter-client";
import promisify from 'es6-promisify';


var titterSender = {};
titterSender.comment = function(cred, message, imagePath, done) {
    var twitterClient = new Twitter.RestClient(
        nconf.get('api:twitterLogin:consumerKey'),
        nconf.get('api:twitterLogin:consumerSecret'),
        cred.token,
        cred.tokenSecret
    );

    twitterClient.statusesUpdateWithMedia({
            'status': message,
            'media[]': imagePath
        },
        function(error, result) {
            if (error) {
                var err = 'Titter-sender error: ' + (error.code ? error.code + ' ' + error.message : error.message);
                console.log(err);
                done(err);
            }
            if (result) {
                console.log(result);
                done(null, result);
            }
        });
};

titterSender.upload = function(creds, file, cb) {

    var twitter = TwitterClient.AuthClient();
    console.log("Upload media called!");
        var params = {
            media: file
        };
    console.log(params,creds);
    twitter.uploadMedia(params, creds.token, creds.tokenSecret, function(err, data) {
        if (err) {
            console.log('Upload error:', err);
            cb(err);
        } else {
            console.log("Upload result",data);
            cb(!1, data);
        }
    });
};

titterSender.reply = function(creds, message, files, cb) {
    var twitter = TwitterClient.Client({
            consumer_key: nconf.get('api:twitterLogin:consumerKey'),
            consumer_secret: nconf.get('api:twitterLogin:consumerSecret')
        }),
        params = {
            status: message,
            media_ids: files.length === 1 ? files[0] : files.join(',')
        };
    console.log(params);
    twitter.statuses('update', params, creds.token, creds.tokenSecret, function(err, data, res) {
        if (err) {
            console.log('Reply error:', err);
            cb(err);
        } else {
            cb(!1, !0);
            console.log('Reply ok!');
        }
    });
};


titterSender.uploadP = promisify(titterSender.upload);
titterSender.replyP = promisify(titterSender.reply);

module.exports = titterSender;

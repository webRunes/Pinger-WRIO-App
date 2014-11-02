var Twitter = require('node-twitter');

var titterPicture = require('./titter-picture')
var config = require('./config.json')

var twitter = new Twitter.RestClient(
  config.consumer_key,
  config.consumer_secret,
  config.token,
  config.token_secret
)

var titterSender = {};

titterSender.comment = function(imgSrc, callback) {
  twitter.statusesUpdateWithMedia(
    { 
    'status': "",
    'media[]': imgSrc 
    }, 
    callback
  );
}

module.exports = titterSender;

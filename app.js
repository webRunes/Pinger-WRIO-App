var express = require('express');
var bodyParser = require('body-parser');

var path = require('path');

var titterPicture = require('./titter-picture');
var titterSender = require('./titter-sender');

var app = express();

app.use(bodyParser.urlencoded());

app.get('/', function(req, res) {
  console.log('getting');
  res.render('index.ejs');
})

app.post('/', function(req, res) {
  titterPicture.drawComment(req.body.comment, function(err, image) {
    image.write('comment.png', function(err) {
      if(!err) {
        titterSender.comment('comment.png', function(err, data) {
          if(err)
            console.log(err)
          else
            console.log(data)
        })
      }
    })
  })
  res.end()
})

/*
 *
*/

app.listen(3000, function() {
  console.log('Listening');
})

var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(app).listen(1234);

var titterPicture = require('./titter-picture');
var titterSender = require('./titter-sender');

app.get('/', function (request, response) {
	//console.log('getting');
	response.render('index.ejs');
})

app.post('/', function (request, response) {
	titterPicture.drawComment(request.body.comment, function (error, image) {
		image.write('comment.png', function (error) {
			if (!error) {
				titterSender.comment('comment.png', function (error, data) {
					if (error)
						console.log(error)
					else
						console.log(data)
				})
			}
		})
	})
	response.end()
})
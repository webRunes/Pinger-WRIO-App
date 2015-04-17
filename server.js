var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(app).listen(5001);
var fs = require('fs');
var wrioLogin = require('./wriologin')

var titterPicture = require('./titter-picture');
var titterSender = require('./titter-sender');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
	response.render('index.ejs');
})


app.get('/callback',function(request,response) {
	response.render('callback', {});
})

app.post('/sendComment', function (request, response) {
	try {
		var imageFileData = request.body.fileData;
		var message = request.body.comment;
		var ssid = request.body.ssid;
		wrioLogin.getTwitterCredentials(ssid, function (err,cred) {
			if (err) {
				console.log ("Twitter auth failed");
				//response.send('Failed');
				response.status(401);
				response.send('Failed: '+err);
				response.end()
				return;
			} else {
				console.log("got keys",cred);
				titterPicture.drawComment(imageFileData, function (error, data) {
					var imagePath = "./images/temp.png";
					titterSender.comment(cred, message+' Donate 0 WRG', imagePath,function done(err,res) {
						if (err) {
							response.status(400);
							response.send(err);
							response.end()
						} else {
							response.send('Done');
							response.end()
						}
					});

				});
			}
		});

	} catch (error) {
		console.log("Error in sendcomment ",error);
	} finally {

		//
	}
});
console.log("Application Started!");
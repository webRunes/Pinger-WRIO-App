var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(app).listen(5001);
var fs = require('fs');


var nconf = require("./wrio_nconf.js").init();
var session = require('express-session');
var SessionStore = require('express-mysql-session')
var cookieParser = require('cookie-parser');

var wrioLogin = require('./wriologin');

var titterPicture = require('./titter-picture');
var titterSender = require('./titter-sender');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');



MYSQL_HOST = nconf.get("db:host");
MYSQL_USER = nconf.get("db:user");
MYSQL_PASSWORD = nconf.get("db:password");
MYSQL_DB = nconf.get("db:dbname");
DOMAIN= nconf.get("db:workdomain");


var session_options = {
	host: MYSQL_HOST,
	port: 3306,
	user: MYSQL_USER,
	password: MYSQL_PASSWORD,
	database: MYSQL_DB
}

var sessionStore = new SessionStore(session_options)

app.use(session(
	{
		secret: 'keyboard cat',
		saveUninitialized: false,
		store: sessionStore,
		resave: false,
		cookie: {domain:DOMAIN},
		key: 'sid'
	}
));

app.use(cookieParser());


app.get('/', function (request, response) {


	console.log(request.sessionID);
	wrioLogin.loginWithSessionId(request.sessionID,function(err,res) {
		if (err) {
			console.log("User not found")
			response.render('index.ejs',{"error":"Not logged in","user":undefined});
		} else {
			response.render('index.ejs',{"user":res});
			console.log("User found "+res);
		}
	})
})


app.get('/callback',function(request,response) {
	console.log("Our callback called");
	response.render('callback', {});
})

app.post('/sendComment', function (request, response) {

		var imageFileData = request.body.fileData;
		var message = request.body.comment;
		//var ssid = request.body.ssid;
		var ssid = request.sessionID;
		console.log("Sending comment "+message+" with ssid "+ssid);

		wrioLogin.getTwitterCredentials(ssid, function (err,cred) {
			if (err) {
				console.log ("Twitter auth failed");
				//response.send('Failed');
				response.status(401);
				response.send('Failed: '+err);
				return;
			} else {
				console.log("got keys",cred);
				titterPicture.drawComment(imageFileData, function (error, data) {
					var imagePath = "./images/temp.png";
					titterSender.comment(cred, message+' Donate 0 WRG', imagePath,function done(err,res) {
						if (err) {
							response.status(400);
							response.send(err);
						} else {
							response.send('Done');
						}
					});

				});
			}
		});


});
console.log("Application Started!");
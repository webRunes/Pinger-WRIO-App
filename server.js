'use strict';
var nconf = require("./wrio_nconf.js")
	.init();

var fs = require('fs');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var wrioLogin;
var titterPicture = require('./titter-picture');
var titterSender = require('./titter-sender');
var DOMAIN = nconf.get('db:workdomain');

var express = require('express');
var app = require("./wrio_app.js")
	.init(express);
/*var MongoClient = require('mongodb')
	.MongoClient;
*/
var db = require('./utils/db.js');
app.custom = {};

var mongoUrl = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');

db.mongo({
		url: mongoUrl
	})
	.then(function(res) {
		console.log("Connected correctly to database");
		var db = res.db || {};
		var server = require('http')
			.createServer(app)
			.listen(nconf.get("server:port"), function(req, res) {
				console.log('app listening on port ' + nconf.get('server:port') + '...');
				app.use('/api/', (require('./api/api-search.js')));
				app.use('/api/', (require('./api/api-reply.js')));
				console.log("Application Started!");
			});
	})
	.catch(function(err) {
		console.log('Error connect to database:' + err.code + ': ' + err.message);
	});


function server_setup() {
	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');

	//var SessionStore = require('express-mysql-session');
	var SessionStore = require('connect-mongo')(session);
	var cookie_secret = nconf.get("server:cookiesecret");
	app.use(cookieParser(cookie_secret));
	var sessionStore = new SessionStore({
		db: app.custom.db
	});
	app.use(session({

		secret: cookie_secret,
		saveUninitialized: true,
		store: sessionStore,
		resave: true,
		cookie: {
			secure: false,
			domain: DOMAIN,
			maxAge: 1000 * 60 * 60 * 24 * 30
		},
		key: 'sid'
	}));

	var p3p = require('p3p');
	app.use(p3p(p3p.recommended));

	var argv = require('minimist')(process.argv.slice(2));
	if (argv.testjsx == "true") {
		console.log("\nEntering jsx widget test mode, use /test.html to check widget operation\n");
		app.use(express.static(__dirname + '/widget'));
		app.use(express.static(__dirname + '/test'));

	}

	app.get('/', function(request, response) {
		console.log(request.sessionID);
		wrioLogin.loginWithSessionId(request.sessionID, function(err, res) {
			if (err) {
				console.log("User not found:", err);
				response.render('index.ejs', {
					"error": "Not logged in",
					"user": undefined
				});
			} else {
				response.render('index.ejs', {
					"user": res
				});
				console.log("User found " + res);
			}
		})
	});


	app.get('/logoff', function(request, response) {
		console.log("Logoff called");
		response.clearCookie('sid', {
			'path': '/',
			'domain': DOMAIN
		});
		response.redirect('/');

	});


	app.get('/callback', function(request, response) {
		console.log("Our callback called");
		response.render('callback', {});
	});

	app.post('/sendComment', function(request, response) {

		var text = request.body.text;
		var title = request.body.title;
		var message = request.body.comment;
		//var ssid = request.body.ssid;
		var ssid = request.sessionID;
		console.log("Sending comment " + message + " with ssid " + ssid);

		wrioLogin.getTwitterCredentials(ssid, function(err, cred) {
			if (err) {
				console.log("Twitter auth failed");
				//response.send('Failed');
				response.status(401);
				response.send('Failed: ' + err);
				return;
			} else {
				console.log("got keys", cred);
				titterPicture.drawComment(text, function(error, filename) {
					titterSender.comment(cred, title + '\n' + message + ' Donate 0 WRG', filename, function done(err, res) {
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

	console.log("Titter server config finished");
};

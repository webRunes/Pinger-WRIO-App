'use strict';
var nconf = require("./wrio_nconf.js")
	.init();
var multer = (require('multer'))();

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

var mongoUrl = 'mongodb://' + nconf.get('mongo:user') + ':' + nconf.get('mongo:password') + '@' + nconf.get('mongo:host') + '/' + nconf.get('mongo:dbname');

app.ready = function() {};

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
				server_setup(db);
				console.log("Application Started!");
				app.ready();
			});
	})
	.catch(function(err) {
		console.log('Error connect to database:' + err.code + ': ' + err.message);
	});


function server_setup(db) {

	wrioLogin = require('./wriologin')(db);

	app.set('views', __dirname + '/views');
	app.set('view engine', 'ejs');
	//var SessionStore = require('express-mysql-session');
	var SessionStore = require('connect-mongo')(session);
	var cookie_secret = nconf.get("server:cookiesecret");
	app.use(cookieParser(cookie_secret));
	var sessionStore = new SessionStore({
		db: db
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
	app.use(express.static(__dirname + '/'));

	var argv = require('minimist')(process.argv.slice(2));
	if (argv.testjsx == "true") {
		console.log("\nEntering jsx widget test mode, use /test.html to check widget operation\n");
		app.use(express.static(__dirname + '/widget'));
		app.use(express.static(__dirname + '/test'));

	}

	app.get('/', function(request, response) {
		console.log(request.sessionID);
		var command = '';
		for (var i in request.query) {
			if (command === '') {
				command = i;
			}

		}
		switch (command) {
			case 'create':
				{

					var origin = request.query.origin;
					console.log('ORIGIN: ',origin);

					wrioLogin.loginWithSessionId(request.sessionID, function(err, res) {
						if (err) {
							console.log("User not found:", err);
							response.render('create.ejs', {
								"error": "Not logged in",
								"user": undefined,
								"host": decodeURIComponent(origin)
							});
						} else {
							response.render('create.ejs', {
								"user": res,
								"host": decodeURIComponent(origin)
							});
							console.log("User found " + res);
						}
					});
					break;
				}
			default:
				{
					response.sendFile(__dirname + '/index.htm');
				}
		}
	});


	app.get('/logoff', function(request, response) {
		console.log("Logoff called");
		response.clearCookie('sid', {
			'path': '/',
			'domain': DOMAIN
		});
		response.redirect('/?create');

	});


	app.get('/callback', function(request, response) {
		console.log("Our callback called");
		response.render('callback', {});
	});

	app.post('/sendComment', multer.array('images[]'), function(request, response) {
		var text = request.body.text;
		var title = request.body.title || '';
		var message = request.body.comment || '';
		//var ssid = request.body.ssid;
		var ssid = request.sessionID || '';
		var images = [];
		console.log("Sending comment " + message + " with ssid " + ssid);

		function lastFileDispatcher(files, cred, fileHandler, lastFileHandler) {
			console.log('lastFileDispatcher',files);


			files.forEach(function(e, i) {
				if (i < 2 && i < request.files.length - 1) {
					fileHandler(e, cred);
				} else if (i === 2 || i === request.files.length - 1) {
					lastFileHandler(e, cred);
				}
			})
		}

		function fileHandler(file, cred) {
			console.log('fileHandler');
			titterSender.upload(cred, file.buffer, function(err, data) {
				if (err) {
					response.status(400)
						.send(err);
				} else {
					try {
						data = JSON.parse(data);
					} catch (e) {}
					images.push(data.media_id_string);
				}
			});
		}

		function lastFileHandler(file, cred) {
			console.log('lastFileHandler');
			titterSender.upload(cred, file.buffer, function(err, data) {
				if (err) {
					response.status(400)
						.send(err);
				} else {
					try {
						data = JSON.parse(data);
					} catch (e) {}
					images.push(data.media_id_string);
					sendTitterComment(cred);
				}

			});
		}

		function sendTitterComment(cred) {

			if (text) {
				titterPicture.drawComment(text, function(error, filename) {
					titterSender.upload(cred, filename, function(err, data) {
						if (err) {
							response.status(400)
								.send(err);
						} else {
							try {
								console.log(data);
								data = JSON.parse(data);
							} catch (e) {

							}

							images.unshift(data.media_id_string);

							console.log("Sending images: ",images);
							titterSender.reply(cred, title + '\n' + message + ' Donate 0 WRG', images, function(err, res) {
								if (err) {
									response.status(400);
									response.send(err);
								} else {
									response.send('Done');
								}
							})
						}
					});
				});
			} else {
				titterSender.reply(cred, title + '\n' + message + ' Donate 0 WRG', images, function(err, res) {
					if (err) {
						response.status(400);
						response.send(err);
					} else {
						response.send('Done');
					}
				})
			}

		}

		wrioLogin.getTwitterCredentials(ssid, function(err, cred) {
			if (err) {
				console.log("Twitter auth failed");
				//response.send('Failed');
				response.status(401);
				response.send('Failed: ' + err);
				return;
			} else {
				console.log("got keys", cred);
				if (request.files.length > 0) {
					lastFileDispatcher(request.files, cred, fileHandler, lastFileHandler);
					return;
				}
				if (text) {
					sendTitterComment(cred);
					return;
				}
				response.status(400).send("No arguments given");


			}
		});

	});

	console.log("Titter server config finished");
};

module.exports = app; // For unit testing purposes

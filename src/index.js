'use strict';
import nconf from "./wrio_nconf.js"
import multer from 'multer';
import fs from 'fs';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import {loginWithSessionId,getTwitterCredentials,getLoggedInUser,getTwitterCreds} from './wriologin.js'
import titterPicture from './titter-picture';
import titterSender from './titter-sender';
import express from 'express';
import {init} from './utils/db.js';
import {dumpError} from './utils/utils.js'
import request from 'superagent';

var DOMAIN = nconf.get('db:workdomain');

var app = require("./wrio_app.js")
	.init(express);

app.ready = function() {};

init()
	.then(function(db) {
		console.log("Connected correctly to database");
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

	//wrioLogin = require('./wriologin')(db);

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

	app.get('/', async (request, response) => {
		try {

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
					console.log('ORIGIN: ', origin);

					try {
						var user = await getLoggedInUser(request.sessionID);
						if (user) {
							console.log("User found " + user);
							response.render('create.ejs', {
								"user": user,
								"userID": request.query.id,
								"host": decodeURIComponent(origin)
							});
						} else {
							throw new Error("Error getting user profile");
						}
					} catch (e) {
						console.log("User not found:");
						response.render('create.ejs', {
							"error": "Not logged in",
							"user": undefined,
							"host": decodeURIComponent(origin),
							"userID": ""
						});
					}
					break;
				}
				default:
				{
					response.sendFile(__dirname + '/views/index.htm');
				}
			}
		} catch (e) {
			console.log("Error during request",e);
			response.status(400).send("Fault");
		}
	});


	app.get('/logoff', function(request, response) {
		console.log("Logoff called");
		response.clearCookie('sid', {
			'path': '/',
			'domain': DOMAIN
		});
		response.send("OK");
		//response.redirect('/?create');

	});


	app.get('/callback', function(request, response) {
		console.log("Our callback called");
		response.render('callback', {});
	});


	function requesDonate(to,amount,ssid) {
		return new Promise((resolve,reject) => {
			var url = 'http://webgold'+nconf.get('server:workdomain')+"/api/webgold/donate?amount="+amount+"&to="+to+"&sid="+ssid;
			console.log(url);
			request.get(url).
				end((err,res) => {
					if (err) {
						return reject(err);
					}
					resolve(res.body);
			});
		});

	}


	app.post('/sendComment', multer().array('images[]'), async (request, response) => {
		var text = request.body.text;
		var title = request.body.title || '';
		var message = request.body.comment || '';
		var ssid = request.sessionID || '';
		var images = [];

		console.log("Sending comment " + message);


		 var sendTitterComment = async (cred, amount) => { // sends comment and
			 console.log("SendTitterComment");

			if (text) {
				var filename = await titterPicture.drawCommentP(text);
				var data = await titterSender.uploadP(cred, filename);

				try {
					console.log(data);
					data = JSON.parse(data);
				} catch (e) {}

				if (data['errors']) {
					throw new Error("Upload failed, check twitter credentials ");
				}

				images.unshift(data.media_id_string);
				console.log("Sending images: ",images);

			}
			 var res = await titterSender.replyP(cred, title + '\n' + message + ' Donate '+ amount +' WRG', images);

		};

		try {
			var cred = await getTwitterCreds(ssid);
			var amount = request.query.amount;
			var to = request.query.to;

			var amountUser = 0;
			var fee = 0;
			var feepercent = 0;

			if (amount > 0 && to) {
				console.log("Starting donate");
				var r = await requesDonate(to,amount,ssid);
				console.log("Donate result",r);
				amountUser = r.amount / 100;
				fee = r.fee / 100;
				feepercent = r.feePercent;

			} else {
				amount = 0;
			}

			console.log("got keys", cred);
			if (request.files.length > 0) { // handle attached files
				console.log("handling attached files:");
				var files = request.files;
				for (var file in files) {
					var data = await titterSender.uploadP(cred, files[file].buffer);
					try {
						data = JSON.parse(data);
					} catch (e) {}
					images.push(data.media_id_string);
				};
			}
			if (text) {
				await sendTitterComment(cred,amount);
			}
			var donateres = {
				"status":'Done',
				"donated":amount,
				amountUser:amountUser,
				fee:fee,
				feePercent: feepercent
			};
			console.log("Donate result: ",donateres);
			response.send(donateres);

		} catch (e) {
			console.log("Twitter auth failed");
			dumpError(e);
			response.status(401).send('Error processing request');

		}



	});

	console.log("Titter server config finished");
};

module.exports = app; // For unit testing purposes

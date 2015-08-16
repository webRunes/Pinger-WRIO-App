var nconf = require("./wrio_nconf.js")
	.init();
var express = require('express');
var app = require("./wrio_app.js")
	.init(express);

var fs = require('fs');

var db = require('./utils/db.js');

var session = require('express-session');
var cookieParser = require('cookie-parser');

var wrioLogin = require('./wriologin');

var titterPicture = require('./titter-picture');
var titterSender = require('./titter-sender');

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

var cookie_secret = nconf.get("server:cookiesecret");
app.use(cookieParser(cookie_secret));
app.use(session({
	cookie: {
		maxAge: 36000000,
		httpOnly: false
	},
	secret: cookie_secret,
	saveUninitialized: true,
	resave: false
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
			console.log("User not found")
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
				app.use('/api/', (require('./chess/route.js'))({
					db: db
				}));
				console.log("Application Started!");
			});
	})
	.catch(function(err) {
		console.log('Error connect to database:' + err.code + ': ' + err.message);
	});

var nconf = require("./wrio_nconf.js").init();
var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(app).listen(nconf.get("server:port") , function(req , res){
    console.log('app listening on port ' + nconf.get('server:port') + '...');
});
var fs = require('fs');



var session = require('express-session');
var SessionStore = require('express-mysql-session');
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

var cookie_secret = nconf.get("server:cookiesecret");
var sessionStore = new SessionStore(session_options);
app.use(cookieParser(cookie_secret));
app.use(session(
	{

		secret: cookie_secret,
		saveUninitialized: true,
		store: sessionStore,
		resave: true,
		cookie: {
			secure:false,
			domain:DOMAIN,
			maxAge: 1000 * 60 * 24 * 30
		},
		key: 'sid'
	}
));

app.use(express.static(__dirname + '/widget'));
app.use(express.static(__dirname + '/test'));

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
});


app.get('/logoff',function(request,response) {
	console.log("Logoff called");
	response.clearCookie('sid',{'path':'/','domain':DOMAIN});
	response.redirect('/');

});


app.get('/callback',function(request,response) {
	console.log("Our callback called");
	response.render('callback', {});
});

app.post('/sendComment', function (request, response) {

		var text = request.body.text;
		var title = request.body.title;
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
				titterPicture.drawComment(text, function (error, filename) {
					titterSender.comment(cred,title+'\n'+ message+' Donate 0 WRG', filename, function done(err,res) {
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
"use strict";

var TwitterClient = require("./twitter-client");
var titterPicture = require('../titter-picture');
var titterSender = require('../titter-sender');
var chessController = new(require('./controller.js'))();
var fs = require("fs");
var _session = {
	titterUrl: '',
	creds: {}
};

var $ = function(args, cb) {

	var $ = this,
		args = args || {},
		app = args.app || {},
		db = app.custom.db || {},
		cb = cb || function() {};

	chessController.init({
		app: app
	}, function(err, data) {});

	app.post('/api/search', function(req, res) {
		_session.creds = req.body.twitterCreds;
		_session.titter = req.body.titterUrl;
		chessController.search({
			creds: _session.creds,
			query: req.body.query
		}, function(err, data) {
			if (err) {
				res.status(err.status)
					.send(err.text);
			} else {
				res.status(200)
					.json(data);
			}
		});
	});

	app.post('/api/game/start', function(req, res) {
		var status = req.body.status,
			opponent = req.body.opponent;
		chessController.startGame({
			status: status,
			opponent: opponent,
			creds: _session.creds,
			titter: _session.titter
		}, function(err, data) {
			if (err) {
				res.status(err.status)
					.send(err.text);
			} else {
				res.status(200)
					.json(data);
			}
		});
	});

	app.get('/api/access_callback', function(req, res) {
		var oauthToken = req.query.oauth_token,
			oauthVerifier = req.query.oauth_verifier;
		chessController.access({
			oauthToken: oauthToken,
			oauthVerifier: oauthVerifier,
			titter: _session.titter,
			creds: _session.creds
		}, function(err, data) {
			if (err) {
				console.log(err)
				res.status(err.status)
					.send(err.text);
			} else {
				res.status(200)
					.send('<script>window.close()</script>');
			}
		});
	});

	app.get('/api/game/invite', function(req, res) {
		chessController.acceptInvite({
			invite: req.query.inv,
			creds: _session.creds
		}, function(err, data) {
			if (err) {
				res.status(err.statusCode)
					.send(err.message);
			} else {
				if (data.url) {
					res.status(200)
						.send('<script>location.href=' + data.url + '</script>');
				} else {
					res.status(200)
						.send('<script>window.close()</script>');
				}
			}
		});
	});

	return $;
}

module.exports = $;

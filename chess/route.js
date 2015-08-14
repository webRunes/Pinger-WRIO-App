"use strict";

var express = require('express');
var TwitterClient = require("../utils/twitter-client");
var titterPicture = require('../titter-picture');
var titterSender = require('../titter-sender');
var chessController = new(require('./controller.js'))();
var fs = require("fs");

var $ = function(args, cb) {

	var $ = this,
		args = args || {},
		db = args.db || {},
		cb = cb || function() {},
		router = express.Router();

	chessController.init({
		db: db
	});

	router.post('/search', function(req, res) {
		var creds = req.body.twitterCreds || {},
			titter = req.body.titterUrl || {};
		chessController.search({
				creds: creds,
				titter: titter,
				query: req.body.query
			})
			.then(function(data) {
				res.status(200)
					.json(data);
			})
			.catch(function(err) {
				res.status(err.status || err.statusCode || 500)
					.json(err.text || err);
			});
	});

	router.post('/game/start', function(req, res) {
		var status = req.body.status || {},
			opponent = req.body.opponent || '';
		chessController.startGame({
				status: status,
				opponent: opponent,
			})
			.then(function(data) {
				console.log(data)
				res.status(200)
					.json({
						message: data
					});
			})
			.catch(function(err) {
				res.status(err.status || err.statusCode || 500)
					.json(err.text || err || 'Internal Server Error');
			});
	});

	router.get('/access_callback', function(req, res) {
		var oauthToken = req.query.oauth_token || '',
			oauthVerifier = req.query.oauth_verifier || '';
		chessController.userAccessRequestCallback({
				oauthToken: oauthToken,
				oauthVerifier: oauthVerifier,
			})
			.then(function() {
				res.status(200)
					.send('<script>window.close()</script>');
			})
			.catch(function(err) {
				res.status(err.status)
					.send(err.text);
			});
	});

	router.get('/game/invite', function(req, res) {
		chessController.startGameRequestCallback({
				invite: req.query.inv
			})
			.then(function(data) {
				console.log(data);
				res.status(200)
					.send('<script>window.close()</script>');
			})
			.catch(function(err) {
				res.status(err.statusCode)
					.send(err.message);
			});
	});

	router.get('/game/invite/access_callback', function(req, res) {
		var oauthToken = req.query.oauth_token,
			oauthVerifier = req.query.oauth_verifier;
		chessController.opponentAccessRequestCallback({
				oauthToken: oauthToken,
				oauthVerifier: oauthVerifier,
			})
			.then(function(data) {
				console.log(data)
				res.status(200)
					.send('<script>window.close()</script>');
			})
			.catch(function(err) {
				console.log(err)
				res.status(err.statusCode)
					.send(err.message);
			});
	});

	return router;
}

module.exports = $;

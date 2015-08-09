var TwitterClient = require("./twitter-client");
var Promise = require('es6-promise')
	.Promise;

exports.auth = function(args) {
	var args = args || {},
		status = args.status || {},
		opponent = args.opponent || '',
		name = status.user.screen_name || '',
		creds = args.creds || {},
		db = args.db || {},
		users = db.collection('users');
	return new Promise(function(resolve, reject) {
		users.find({
				name: name
			})
			.toArray(function(err, data) {
				if (err || data.length === 0 || (data[0] && data[0].accessToken === '')) {
					accessRequest({
							status: status,
							name: name,
							creds: creds,
							is_callback: args.is_callback
						})
						.then(function(res) {
							if (data[0] && data[0].accessToken === '') {
								users.update({
									name: name
								}, {
									$set: {
										requestToken: res.requestToken,
										requestTokenSecret: res.requestTokenSecret
									}
								}, function(err, res) {
									reject(err);
								});
							} else {
								users.insert([{
									name: name,
									requestToken: res.requestToken,
									requestTokenSecret: res.requestTokenSecret,
									accessToken: '',
									accessTokenSecret: '',
									last_opponent: opponent
								}], function(err, res) {
									reject(err);
								});
							}
						})
						.catch(function(err) {
							reject(err);
						});
				} else {
					var twitter = TwitterClient.Client(creds);
					twitter.verifyCredentials(data[0].accessToken, data[0].accessTokenSecret, function(error, _data, res) {
						if (error) {
							accessRequest({
									status: status,
									name: name,
									creds: creds,
									is_callback: args.is_callback
								})
								.then(function(res) {
									users.update({
										name: name
									}, {
										$set: {
											requestToken: res.requestToken,
											requestTokenSecret: res.requestTokenSecret,
											accessToken: '',
											accessTokenSecret: '',
											last_opponent: opponent
										}
									}, function(err, res) {
										reject(err);
									});
								})
								.catch(function(err) {
									reject(err);
								});
						} else {
							resolve(data[0]);
						}
					});
				}
			});
	});
};

var accessRequest = function(args) {
	var args = args || {},
		status = args.status || {},
		name = args.name || '',
		creds = args.creds || {};
	return new Promise(function(resolve, reject) {
		var twitter = args.is_callback ? TwitterClient._Client(creds) : TwitterClient.Client(creds);
		twitter.getRequestToken(function(err, requestToken, requestTokenSecret, results) {
			if (err) {
				reject(err);
			} else {
				var params = {
					status: '@' + name + ' ' + twitter.getAuthUrl(requestToken),
					in_reply_to_status_id: status.id_str,
					screen_name: name
				};
				twitter.statuses('update', params, creds.access_token, creds.access_secret, function(err, _data, res) {
					if (err) {
						reject(err);
					} else {
						resolve({
							requestToken: requestToken,
							requestTokenSecret: requestTokenSecret
						});
					}
				});
			}
		});
	});
}

exports.setAccessToken = function(args) {
	var args = args || {},
		oauthToken = args.oauthToken || '',
		oauthVerifier = args.oauthVerifier || '',
		db = args.db,
		users = db.collection('users'),
		creds = args.creds || {};
	return new Promise(function(resolve, reject) {
		var twitter = TwitterClient.Client(creds);
		users.find({
				requestToken: oauthToken
			})
			.toArray(function(err, data) {
				if (data[0] && data[0].requestTokenSecret) {
					twitter.getAccessToken(oauthToken, data[0].requestTokenSecret, oauthVerifier, function(error, accessToken, accessTokenSecret, results) {
						if (error) {
							reject(error);
						} else {
							twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, _data, res) {
								if (error) {
									reject(error);
								} else {
									users.update({
										requestToken: oauthToken
									}, {
										$set: {
											accessToken: accessToken,
											accessTokenSecret: accessTokenSecret
										}
									}, function(error, _data) {
										if (error) {
											reject(error);
										} else {
											data[0].accessToken = accessToken;
											data[0].accessTokenSecret = accessTokenSecret;
											resolve(data[0]);
										}
									});
								}
							});
						}
					});
				}
			});
	});
}

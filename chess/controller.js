"use strict";

var TwitterClient = require("./twitter-client");

var $ = (function() {

	var $ = function() {};

	$.prototype = {
		db: {},
		init: function(args, cb) {
			var $ = this,
				args = args || {},
				cb = cb || function() {};
			$.db = args.app.custom.db;
			if ($.app) {
				cb(null, !0)
			} else {
				cb(!1, null);
			};
			return $;
		},
		search: function(args, cb) {
			var $ = this,
				args = args || {},
				cb = cb || function() {},
				creds = args.creds || {},
				query = args.query || '',
				twitter = TwitterClient.Client(creds);
			twitter.search(query, creds.access_token, creds.access_secret, function(err, data) {
				if (err) {
					cb(err, {
						ok: !1
					});
					console.log("Error in search"+err);
					return;
				}
				console.log('Found ' + data.statuses.length + ' statuses');
				if (data.statuses.length > 0) {
					cb(!1, {
						statuses: data.statuses
					});
				} else {
					cb({
						status: 404,
						text: 'Nothing found'
					}, {
						ok: !1
					});
				}
			});
			return $;
		},
		startGame: function(args, cb) {
			var $ = this,
				args = args || {},
				cb = cb || function() {},
				status = args.status || '',
				opponent = args.opponent || '',
				creds = args.creds || {},
				titter = args.titter || '',
				users = $.db.collection('users'),
				chess = $.db.collection('chess'),
				twitter = TwitterClient.Client(creds);
			users.find({
					name: status.user.screen_name
				})
				.toArray(function(err, data) {
					var invite = (new Date())
						.getTime()
						.toString(32) + (Math.random() * 1000000)
						.toString(32);
					if (err || data.length === 0 || (data[0] && data[0].accessToken === '')) {
						twitter.getRequestToken(function(err, requestToken, requestTokenSecret, results) {
							if (err) {
								cb(err, !1);
								console.log("Error getting OAuth request token : " + err);
							} else {
								var params = {
									status: '@' + status.user.screen_name + ' ' + twitter.getAuthUrl(requestToken),
									in_reply_to_status_id: status.id_str,
									screen_name: status.user.screen_name
								};
								twitter.statuses('update', params, creds.access_token, creds.access_secret, function(err, _data, res) {
									if (err) {
										cb(err, {
											ok: !1
										});
									} else {
										if (data[0]) {
											users.update({
													name: status.user.screen_name
												}, {
													$set: {
														invite: invite,
														opponent: opponent,
														requestToken: requestToken,
														requestTokenSecret: requestTokenSecret,
													}
												},
												function(err, res) {
													if (err) {
														cb(err, {
															ok: !1
														});
													} else {
														cb(!1, {
															ok: !0
														});
														console.log("Access request to @" + status.user.screen_name + " was sent");
													}
												});
										} else {
											users.insert([{
												name: status.user.screen_name,
												requestToken: requestToken,
												requestTokenSecret: requestTokenSecret,
												accessToken: '',
												accessTokenSecret: '',
												opponent: opponent,
												invite: invite
											}], function(err, res) {
												if (err) {
													cb(err, {
														ok: !1
													});
												} else {
													cb(!1, {
														ok: !0
													});
													chess.insert([{
														checked: !1,
														invite: invite,
														name: status.user.screen_name,
														opponent: opponent,
														fen: ''
													}]);
													console.log("Access request to @" + status.user.screen_name + " was sent");
												}
											});
										}
									}
								});
							}
						});
					} else {
						var params = {
							status: '@' + opponent + " Join to game " + titter + "/api/game/invite?inv=" + invite,
							screen_name: opponent
						};
						twitter.statuses('update', params, data[0].accessToken, data[0].accessTokenSecret, function(err, data, res) {
							if (err) {
								cb(err, {
									ok: !1
								});
							} else {
								users.update({
										name: status.user.screen_name
									}, {
										$set: {
											invite: invite,
											opponent: opponent
										}
									},
									function(err, res) {});
								chess.find({
										invite: invite
									})
									.toArray(function(err, data) {
										if (err || data.length === 0) {
											chess.insert([{
												checked: !0,
												invite: invite,
												name: status.user.screen_name,
												opponent: opponent,
												fen: ''
											}]);
											cb(!1, {
												ok: !0
											});
										}
									});
								console.log("Game request to @" + opponent + " was sent");
							}
						});
					}
				});
			return $;
		},
		access: function(args, cb) {
			var $ = this,
				args = args || {},
				cb = cb || function() {},
				creds = args.creds || {},
				oauthToken = args.oauthToken || '',
				oauthVerifier = args.oauthVerifier || '',
				titter = args.titter,
				users = $.db.collection('users'),
				chess = $.db.collection('chess'),
				twitter = TwitterClient.Client(creds);
			users.find({
					requestToken: oauthToken
				})
				.toArray(function(err, data) {
					if (err || data.length === 0) {
						cb({
							status: 200,
							message: 'Invalid or expired token'
						}, !1);
					} else {
						twitter.getAccessToken(oauthToken, data[0].requestTokenSecret, oauthVerifier, function(error, accessToken, accessTokenSecret, results) {
							if (error) {
								cb(error, !1);
							} else {
								twitter.verifyCredentials(accessToken, accessTokenSecret, function(error, data, res) {
									if (error) {
										cb(error, !1);
									} else {
										users.update({
											requestToken: oauthToken
										}, {
											$set: {
												accessToken: accessToken,
												accessTokenSecret: accessTokenSecret
											}
										}, function(err, data) {
											if (err) {
												cb(err, !1);
											} else {
												users.find({
														requestToken: oauthToken
													})
													.toArray(function(err, data) {
														chess.find({
																invite: data[0].invite
															})
															.toArray(function(err, _data) {
																if (err || _data.length === 0) {} else {
																	if (!_data[0].checked) {
																		var params = {
																			status: '@' + data[0].opponent + " Join to game " + titter + "/api/game/invite?inv=" + data[0].invite,
																			screen_name: data[0].opponent
																		};
																		twitter.statuses('update', params, accessToken, accessTokenSecret, function(err, __data, res) {
																			if (err) {
																				cb(err, {
																					ok: !1
																				});
																			} else {
																				chess.update({
																					invite: data[0].invite
																				}, {
																					$set: {
																						checked: !0
																					}
																				}, function(err, data) {
																					if (err) {
																						cb(err, {
																							ok: !1
																						});
																					} else {
																						cb(!1, {
																							ok: !0
																						});
																					}
																				});
																				console.log("Game request to @" + data[0].opponent + " was sent");
																			}
																		});
																	} else {
																		var params = {
																			status: '@' + _data[0].name + " Game Started",
																			screen_name: _data[0].name
																		};
																		twitter.statuses('update', params, accessToken, accessTokenSecret, function(err, data, res) {
																			if (err) {
																				cb(err, {
																					ok: !1
																				});
																			} else {
																				cb(!1, {
																					ok: !0
																				});
																				console.log('Game started!');
																			}
																		});
																	}
																}
															});
													});
											}
										});
									}
								});
							}
						});
					}
				});
			return $;
		},
		acceptInvite: function(args, cb) {
			var $ = this,
				args = args || {},
				cb = cb || function() {},
				invite = args.invite || '',
				creds = args.creds || {},
				chess = $.db.collection('chess'),
				users = $.db.collection('users'),
				twitter = TwitterClient.Client(creds);
			chess.find({
					invite: invite
				})
				.toArray(function(err, _data) {
					if (err || _data.length === 0) {
						cb({
							status: 404,
							message: 'Invalid or expired token'
						}, !1)
					} else {
						users.find({
								name: _data[0].opponent
							})
							.toArray(function(err, data) {
								if (err || data.length === 0 || (data[0] && data[0].accessToken === '')) {
									twitter.getRequestToken(function(err, requestToken, requestTokenSecret, results) {
										if (err) {
											cb(err, !1);
											console.log("Error getting OAuth request token : " + err);
										} else {
											if (data[0]) {
												users.update({
														name: _data[0].opponent
													}, {
														$set: {
															invite: invite,
															opponent: _data[0].name,
															requestToken: requestToken,
															requestTokenSecret: requestTokenSecret,
														}
													},
													function(err, res) {
														if (err) {
															cb(err, {
																ok: !1
															});
														} else {
															cb(!1, {
																ok: !0,
																url: twitter.getAuthUrl(requestToken)
															});
														}
													});
											} else {
												users.insert([{
													name: _data[0].opponent,
													requestToken: requestToken,
													requestTokenSecret: requestTokenSecret,
													accessToken: '',
													accessTokenSecret: '',
													opponent: _data[0].name,
													invite: invite
												}], function(err, res) {
													if (err) {
														cb(err, {
															ok: !1
														});
													} else {
														cb(!1, {
															ok: !0,
															url: twitter.getAuthUrl(requestToken)
														});
													}
												});
											}
										}
									});
								} else {
									var params = {
										status: '@' + _data[0].name + " Game Started",
										screen_name: _data[0].name
									};
									twitter.statuses('update', params, data[0].accessToken, data[0].accessTokenSecret, function(err, data, res) {
										if (err) {
											cb(err, {
												ok: !1
											});
										} else {
											cb(!1, {
												ok: !0
											});
											console.log('Game started!');
										}
									});
								}
							});
					}
				});
		}
	}

	return $;

})();

module.exports = $;

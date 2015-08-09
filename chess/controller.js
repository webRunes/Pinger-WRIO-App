"use strict";

var TwitterClient = require("../utils/twitter-client");
var Promise = require('es6-promise')
	.Promise;
var access = require('../utils/access.js');

var $ = (function() {

	var $ = function() {};

	$.prototype = {
		db: {},
		titter: '',
		creds: {},
		init: function(args) {
			var $ = this,
				args = args || {};
			return new Promise(function(resolve, reject) {
				$.db = args.db;
				if ($.db) {
					resolve();
				} else {
					reject();
				};
			});
		},
		search: function(args) {
			var $ = this,
				args = args || {},
				query = args.query || '';
			$.creds = args.creds || {};
			$.titter = args.titter || '';
			return new Promise(function(resolve, reject) {
				var twitter = TwitterClient.Client($.creds);
				twitter.search(query, $.creds.access_token, $.creds.access_secret, function(err, data) {
					if (err) {
						reject(err);
					} else if (data.statuses.length > 0) {
						console.log('Found ' + data.statuses.length + ' statuses');
						resolve({
							statuses: data.statuses
						});
					} else {
						reject({
							status: 404,
							text: 'Nothing found'
						});
					}
				});
			});
		},
		startGame: function(args) {
			var $ = this,
				args = args || {},
				status = args.status || {},
				opponent = args.opponent || '';
			return new Promise(function(resolve, reject) {
				access.auth({
						status: status,
						opponent: opponent,
						creds: $.creds,
						db: $.db
					})
					.then(function(res) {
						$.startGameRequest(res)
							.then(function(args) {
								resolve(args.message);
							})
							.catch(function(err) {
								reject(err);
							});
					})
					.catch(function(err) {
						if (err) {
							reject(err);
						} else {
							resolve('New user. Access request to @' + status.user.screen_name);
						}
					});
			});
		},
		startGameRequest: function(args) {
			var $ = this,
				args = args || {},
				name = args.name || '',
				opponent = args.last_opponent || '',
				accessToken = args.accessToken || '',
				accessTokenSecret = args.accessTokenSecret || '';
			return new Promise(function(resolve, reject) {
				var twitter = TwitterClient.Client($.creds),
					chess = $.db.collection('chess'),
					inv = new Date()
					.getTime()
					.toString(32) + Math.random()
					.toString(32);
				chess.find({
						name: name,
						opponent: opponent
					})
					.toArray(function(err, data) {
						if (err) {
							reject(err);
						} else if (data.length === 0) {
							chess.insert([{
								invite: inv,
								name: name,
								opponent: opponent,
								status: 0
							}], function(err, res) {
								if (err) {
									reject(err);
								} else {
									var params = {
										status: '@' + opponent + " Join to game " + $.titter + "/api/game/invite?inv=" + inv,
										screen_name: opponent
									};
									twitter.statuses('update', params, accessToken, accessTokenSecret, function(err, data, res) {
										if (err) {
											reject(err);
										} else {
											resolve({
												message: 'Start game request from @' + name + ' to @' + opponent
											});
										}
									});
								}
							});
						} else {
							chess.update({
								name: name,
								opponent: opponent
							}, {
								$set: {
									invite: inv,
									status: 0
								}
							}, function(err, data) {
								if (err) {
									reject(err);
								} else {
									var params = {
										status: '@' + opponent + " Join to game " + $.titter + "/api/game/invite?inv=" + inv,
										screen_name: opponent
									};
									twitter.statuses('update', params, accessToken, accessTokenSecret, function(err, data, res) {
										if (err) {
											reject(err);
										} else {
											resolve({
												message: 'Start game request from @' + name + ' to @' + opponent
											});
										}
									});
								}
							});
						}
					});
			});
		},
		userAccessRequestCallback: function(args) {
			var $ = this,
				args = args || {};
			return new Promise(function(resolve, reject) {
				args.db = $.db;
				args.creds = $.creds;
				access.setAccessToken(args)
					.then(function(args) {
						$.startGameRequest(args)
							.then(function(res) {
								resolve(res.message);
							})
							.catch(function(err) {
								reject(err);
							});
					})
					.catch(function(err) {
						reject(err);
					});
			});
		},
		opponentAccessRequestCallback: function(args) {
			var $ = this,
				args = args || {};
			return new Promise(function(resolve, reject) {
				args.db = $.db;
				args.creds = $.creds;
				access.setAccessToken(args)
					.then(function(args) {
						$.startGameRequestAccept(args)
							.then(function(data) {
								resolve(data.message);
							})
							.catch(function(err) {
								reject(err);
							});
					})
					.catch(function(err) {
						reject(err);
					});
			});
		},
		startGameRequestCallback: function(args) {
			var $ = this,
				args = args || {},
				invite = args.invite,
				chess = $.db.collection('chess');
			return new Promise(function(resolve, reject) {
				chess.find({
						invite: invite
					})
					.toArray(function(err, data) {
						if (err || !data[0]) {
							reject(err || 'Invalid or expired invite token');
						} else {
							access.auth({
									status: {
										user: {
											screen_name: data[0].opponent
										},
										id_str: null
									},
									opponent: data[0].name,
									creds: $.creds,
									db: $.db,
									is_callback: !0
								})
								.then(function(res) {
									$.startGameRequestAccept(res)
										.then(function(res) {
											resolve(res.message);
										})
										.catch(function(err) {
											reject(err);
										});
								})
								.catch(function(err) {
									if (err) {
										console.log(err)
										reject(err);
									} else {
										resolve('New user. Access request to @' + data[0].opponent);
									}
								});
						}
					});
			});
		},
		startGameRequestAccept: function(args) {
			var $ = this,
				args = args || {},
				name = args.last_opponent || '',
				opponent = args.name || '',
				accessToken = args.accessToken || '',
				accessTokenSecret = args.accessTokenSecret || '';
			return new Promise(function(resolve, reject) {
				var twitter = TwitterClient.Client($.creds),
					chess = $.db.collection('chess');
				chess.update({
					name: name,
					opponent: opponent
				}, {
					$set: {
						status: 1
					}
				}, function(err, res) {
					if (err) {
						reject(err);
					} else {
						var params = {
							status: '@' + name + " Game started!",
							screen_name: name
						};
						twitter.statuses('update', params, accessToken, accessTokenSecret, function(err, data, res) {
							if (err) {
								reject(err);
							} else {
								resolve({
									message: '@' + opponent + ' accept game request from @' + name
								});
							}
						});
					}
				});
			});
		}
	}

	return $;

})();

module.exports = $;


/*		updateUser: function(args, cb) {
			var $ = this,
				args = args || {},
				cb = cb || function() {},
				name = args.name || '',
				set = args.set || {},
				users = $.db.collection('users');
			users.update({
					name: name
				}, {
					$set: set
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
			return $;
		},
		newUser: function(args, cb) {
			var $ = this,
				args = args || {},
				cb = cb || function() {},
				users = $.db.collection('users'),
				creds = args.creds || {},
				titter = args.titter || '',
				twitter = TwitterClient.Client(creds),
				chess = $.db.collection('chess');
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
								$.updateUser({
									name: status.user.screen_name,
									set: {
										invite: invite,
										opponent: opponent,
										requestToken: requestToken,
										requestTokenSecret: requestTokenSecret,
									}
								}, function(err, res) {

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
			return $;
		},
		startGame: function(args, cb) {
			var $ = this,
				args = args || {},
				cb = cb || function() {},
				status = args.status || {},
				opponent = args.opponent || '',
				users = $.db.collection('users'),
				creds = args.creds || {},
				titter = args.titter || '',
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
						$.newUser({}, function(err, res) {

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
		},
*/

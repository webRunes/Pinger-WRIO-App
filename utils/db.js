var MongoClient = require('mongodb')
	.MongoClient;
var Promise = require('es6-promise')
	.Promise;

exports.mongo = function(args) {
	var args = args || {},
		url = args.url || '';
	return new Promise(function(resolve, reject) {
		MongoClient.connect(url, function(err, db) {
			if (err) {
				reject({
					code: err.code,
					message: err.message
				});
			} else {
				resolve({
					db: db
				});
			}
		});
	});
}

exports.mySql = function(args) {}

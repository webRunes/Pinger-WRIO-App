var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});
var titterPicture = {}

titterPicture.drawComment = function (imageFileData, callback) {
	var fileName = "temp";
	var buff = new Buffer(imageFileData.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
	fs.writeFile('./images/' + fileName + '.png', buff, function (err) {
		console.log('Uploading done !');
	});
	callback(null, null)
}

module.exports = titterPicture;

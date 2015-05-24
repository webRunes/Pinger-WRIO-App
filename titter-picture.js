var fs = require('fs');
var Canvas = require('canvas');
var titterPicture = {}

var temp = require('temp');

temp.track();

function wrapText(context, text, x, y, maxWidth, lineHeight, simulate) {
	console.log(maxWidth);
	var words = text.split(' ');
	var line = '';

	for(var n = 0; n < words.length; n++) {
		var testLine = line + words[n] + ' ';
		var metrics = context.measureText(testLine);
		var testWidth = metrics.width;
		if (testWidth > maxWidth && n > 0) {
			context.fillText(line, x, y);
			line = words[n] + ' ';
			y += lineHeight;
		}
		else {
			line = testLine;
		}
	}
	if (!simulate) {
		context.fillText(line, x, y);
	}
	return y + 3*lineHeight;


}

function createImage(text,done) {
	var lineHeight = 14;
	var canvas = new Canvas(525, 650);
	var ctx = canvas.getContext('2d');

	var ms_height = wrapText(ctx,text,10,20,canvas.width-10,lineHeight,true) + lineHeight*2;
	canvas.height = ms_height+5;
	console.log(ms_height,canvas.height);

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.font = "12px Tahoma";
	ctx.fillStyle = '#292f33';
	wrapText(ctx,text, 10,20,canvas.width-10,lineHeight);

	ctx.fillStyle = "#aaa";
	ctx.fillText('Posted via Titter - Advanced tweets http://titter.webrunes.com', 10, ms_height);


	canvas.toBuffer(function(err,buf) {
		if (err) {
			console.log("Tobuffer error");
			done(null)
			return;
		}

		temp.open({suffix: '.png'},function (err,file) {
			if (err) {
				console.log("Can't create temporary file");
				done(null);
				return;
			}
			fs.write(file.fd, buf, 0, buf.length, null, function(err, written, buffer) {
				if (err) {
					console.log("Error closing file");
					done(null);
					return;
				}
				fs.close(file.fd, function () {
					console.log("Image written to tmp file ",file.path);
					done(file.path);
				});

			});
			fs.close(file.fd, function (err) {


			});

		});



	});



}


titterPicture.drawComment = function (imageText, callback) {
	createImage(imageText,function (filename) {
		console.log("Create image callback finished");
		if (filename) callback(null, filename); else callback(null);
	});

}

module.exports = titterPicture;

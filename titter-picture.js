var fs = require('fs');
var Canvas = require('canvas');
var titterPicture = {}

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

function createImage(text) {
	var lineHeight = 14;
	var canvas = new Canvas(400, 650);
	var ctx = canvas.getContext('2d');

	var ms_height = wrapText(ctx,text,5,20,canvas.width,lineHeight,true) + lineHeight*2;
	canvas.height = ms_height+5;
	console.log(ms_height,canvas.height);

	ctx.fillStyle = "#ffffff";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.font = "13px Arial";
	ctx.fillStyle = '#292f33';
	//ctx.fillStyle = "#666666";
	wrapText(ctx,text, 5,20,canvas.width,lineHeight);

	ctx.fillStyle = "#aaa";
	ctx.fillText('Posted via Titter - Advanced tweets http://titter.webrunes.com', 2, ms_height);

	var out = fs.createWriteStream(__dirname + '/images/temp.png')
		, stream = canvas.createPNGStream();

	stream.on('data', function(chunk){
		out.write(chunk);
	});


}


titterPicture.drawComment = function (imageText, callback) {
	createImage(imageText);
//	var fileName = "temp";
//	var buff = new Buffer(imageFileData.replace(/^data:image\/(png|gif|jpeg);base64,/, ''), 'base64');
//	fs.writeFile('./images/' + fileName + '.png', buff, function (err) {
//		console.log('Uploading done !');
//	});
	callback(null, null)
}

module.exports = titterPicture;

var fs = require('fs');
var gm = require('gm').subClass({imageMagick: true});

const MAXWIDTH = 100;
const LINEHEIGHT = 20;
const PADDING = 20;
const LETTERWIDTH = 6;
const LINEMAXWIDTH = (MAXWIDTH) / LETTERWIDTH
var titterPicture = {}


titterPicture.drawComment = function (comment, callback) {
	var lines = comment.split("\n");
	var picLines = [];
	for (var i = 0; i < lines.length; i++) {
		if (lines[i].length <= LINEMAXWIDTH + 1) {
			picLines.push(lines[i])
		}
		else {
			var newLine, restOfLine = lines[i];
			while (restOfLine.length > LINEMAXWIDTH + 1) {
				newLine = restOfLine.slice(0, LINEMAXWIDTH + 1)
				newLine = newLine.slice(0, newLine.lastIndexOf(' ') + 1)
				restOfLine = restOfLine.slice(newLine.length)
				picLines.push(newLine)
			}
			picLines.push(restOfLine)
		}
	}

	var height = (LINEHEIGHT * picLines.length) + (PADDING * 2)
	/*
	 var image = gm(10, 20, '#ffffff00');
	 for (var i = 0; i < picLines.length; i++) {
	 image.drawText(PADDING, PADDING + LINEHEIGHT * (i + 1 / 2), picLines[i]);
	 }
	 */
	gm(20, 20, "#ddff99f3").drawText(0, 0, "from scratch").write("/", function (err) {
		console.log(err);
	});
	//callback(null, image)
}

module.exports = titterPicture;

var gm = require('gm');

const MAXWIDTH = 500;
const LINEHEIGHT = 20;
const PADDING = 20;
const LETTERWIDTH = 6;
const LINEMAXWIDTH = (MAXWIDTH) / LETTERWIDTH
var titterPicture = {}


titterPicture.drawComment = function(comment, callback) {
  var lines = comment.split("\n");
  var picLines = [];
  for (var i = 0; i < lines.length; i++) {
    if (lines[i].length <= LINEMAXWIDTH + 1) {
      picLines.push(lines[i])
    }
    else {
      var newLine, restOfLine = lines[i];
      while(restOfLine.length > LINEMAXWIDTH + 1) {
        newLine = restOfLine.slice(0, LINEMAXWIDTH + 1)
        newLine = newLine.slice(0, newLine.lastIndexOf(' ') + 1)
        restOfLine = restOfLine.slice(newLine.length)
        picLines.push(newLine)
      }
      picLines.push(restOfLine)
    }
  }

  var height = (LINEHEIGHT * picLines.length) + (PADDING * 2)

  var image = gm(MAXWIDTH, height, '#ffffff00').setFormat('png');
  for (var i = 0; i < picLines.length; i++) {
    image.drawText(PADDING, PADDING + LINEHEIGHT * (i + 1/2), picLines[i]);
  }
  callback(null, image)
}

module.exports = titterPicture;

const
  splitTextByLines = require('./split_text_by_lines'),
  drawLine = require('./draw_line');

function type(text, w, h, ctx, canvas, font, cb) {
  const
    fontSize = 64,
    lineHeight = Math.round((22 / 650) * h);

  ctx.filter = 'best';
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  var x = Math.round((9 / 500) * w);
  var y = Math.round((20 / 650) * h);
  var currentY = y;
  var maxWidth = w - 2 * x;
  var linesComment = splitTextByLines(ctx, font, fontSize, text, maxWidth);
  var linesOffsetEmpty = ['', ''];
  var linesFooter = splitTextByLines(ctx, font, fontSize, 'Posted via Pinger — Advanced tweets, visit pinger.wrioos.com', maxWidth);

  var totalCountLines = [linesComment, linesOffsetEmpty, linesFooter].reduce((count, lines) => count + lines.length, 0);

  canvas.height = lineHeight * totalCountLines + Math.round((20 / 650) * h);

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  currentY = linesComment.concat(linesOffsetEmpty)
    .reduce(drawLine(ctx, font, fontSize, x, lineHeight, '#292f33'), currentY);

  currentY = linesFooter
    .reduce(drawLine(ctx, font, fontSize, x, lineHeight, '#aaa'), currentY);

  canvas.toBuffer(cb);
}

module.exports = type;

const
  splitTextByLines = require('./split_text_by_lines');

function type(text, w, h, ctx, canvas, font, cb) {
  const
    fontSize = 43,
    lineHeight = Math.round((14 / 650) * h);

  ctx.filter = 'best';
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  var x = Math.round((10 / 500) * w);
  var y = Math.round((20 / 650) * h);
  var maxWidth = w - 2 * x;
  var lines = splitTextByLines(ctx, font, fontSize, text, maxWidth);

  canvas.height = lineHeight * (lines.length + 3) + Math.round((5 / 650) * h);
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#292f33';

  lines.forEach(line => {
    font.draw(ctx, line, x, y, fontSize);
    y += lineHeight;
  });

  var path = font.getPath(
    'Posted via Pinger — Advanced tweets, visit pinger.wrioos.com',
    x,
    lineHeight * (lines.length + 3),
    fontSize
  );

  path.fill = '#aaa';
  path.draw(ctx);

  canvas.toBuffer(cb);
}

module.exports = type;

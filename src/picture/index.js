const
  Canvas = require('canvas-prebuilt'),
  save = require('./save'),
  type = require('./type'),
  getFont = require('./get_font');

function drawComment(text, cb) {
  var quality = 4;
  var w = 500 * quality;
  var h = 650 * quality;
  var canvas = new Canvas(w, h);
  var ctx = canvas.getContext('2d', { alpha: false });

  getFont('../fonts/Roboto-Regular.ttf', (err, font) =>
    err
      ? cb(err)
      : type(text, w, h, ctx, canvas, font, (err, buf) =>
          err
            ? cb(err)
            : save(buf, cb)
        )
  )
}

module.exports = drawComment;

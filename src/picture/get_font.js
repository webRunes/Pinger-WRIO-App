let
  cache = null;

const
    opentype = require('opentype.js'),
    path = require('path');

module.exports = (font_path, cb) =>
  cache
    ? cb(null, cache)
    : opentype.load(path.join(__dirname, font_path), (err, font) =>
        err
          ? cb(err)
          : function () {
              cache = font;
              cb(null, font);
            }()
      );

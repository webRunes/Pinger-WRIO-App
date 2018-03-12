const
  promisify = require("es6-promisify"),
  drawComment = require('./picture/index');

module.exports.drawComment = drawComment;
module.exports.drawCommentP = promisify(drawComment);

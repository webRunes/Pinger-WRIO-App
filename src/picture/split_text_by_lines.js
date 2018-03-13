const
  fit = require('./fit');

module.exports = (ctx, font, fontSize, text, maxWidth) => {
  var words = text.split(' ');
  var line = '';
  var notFit = fit(font, fontSize, maxWidth);
  var lines = [];

  while (words.length) {
    var word = words.shift();
    var test = line === ''
      ? word
      : line + ' ' + word;

    if (notFit(test)) {
      if (line === '') {
        var next = '';
        while(notFit(word)) {
          next = word[word.length - 1] + next;
          word = word.substring(0, word.length - 1);
        }
        words.unshift(next);
        lines.push(word);
      } else {
        lines.push(line);
        line = '';
        words.unshift(word);
      }
      line = '';
    } else {
      line = test;
    }
  }

  line && lines.push(line);

  return lines;
};

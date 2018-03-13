const drawComment = require('./index');

drawComment(
  'This is my text with quite large word. Here it will be. 50 WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW 123 WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW more 3',
  (err, filename) => console.log(err || filename)
);

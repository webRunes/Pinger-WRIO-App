const drawComment = require('./index');

drawComment(
  'This is my text with quite large word. Here it will be. 25W WWWWWWWWWWWWWWWWWWWWWWWWW 26W WWWWWWWWWWWWWWWWWWWWWWWWWW 50W WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW 25W WWWWWWWWWWWWWWWWWWWWWWWWW --- 090909 lalala. Bye!',
  (err, filename) => console.log(err || filename)
);

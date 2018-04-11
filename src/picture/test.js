const drawComment = require('./index');

drawComment(
  'This is my text with quite words. Here it will be.                                  25 "W"                                    WWWWWWWWWWWWWWWWWWWWWWWWW                             26 "W"                              WWWWWWWWWWWWWWWWWWWWWWWWWW                                           50 "W" WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW                                                             25 "W"                                 WWWWWWWWWWWWWWWWWWWWWWWWW                              34"W"                                            WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW                                        35"W" WWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWWW  <- last "W" does not fit',
  (err, filename) => console.log(err || filename)
);

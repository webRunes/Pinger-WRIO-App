var titterPicture = require('./titter-picture');
var titterSender = require('./titter-sender');

var comment = "a comment"
titterPicture.drawComment(comment, function(err, image) {
  image.write('comment.png', function(err) {
    if(!err) {
      titterSender.comment('comment.png', function(err, data) {
        if(err)
          console.log(err)
        else
          console.log(data)
      })
    }
  })
})

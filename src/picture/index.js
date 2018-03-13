
function drawComment(text, cb) {

  var quality = 4;
  var fontSize = 44;
  var w = 500 * quality;
  var h = 650 * quality;
  var lineHeight = Math.round((16 / 650) * h);
  var canvas = document.getElementsByTagName('canvas')[0];

  canvas.height = h;
  canvas.width = w;

  var ctx = canvas.getContext('2d', { alpha: false });
  ctx.mozImageSmoothingEnabled = false;
  ctx.webkitImageSmoothingEnabled = false;
  ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  opentype.load('https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf', (err, font) => {
    err
      ? cb(err)
      : function() {
          var x = Math.round((10 / 500) * w);
          var y = Math.round((20 / 650) * h);
          var maxWidth = w - 2 * x;
          var lines = splitTextByLines(ctx, font, fontSize, text, maxWidth)

          canvas.height = lineHeight * (lines.length + 5) + Math.round((5 / 650) * h);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.font = fontSize + 'px Roboto';
          ctx.fillStyle = '#292f33';

          lines.forEach(line => {
            font.draw(ctx, line, x, y, fontSize);
            //ctx.fillText('---------------'+line, x, y);
            y += lineHeight;
          });

          ctx.fillStyle = '#aaa';
          font.draw(
            ctx,
            'Posted via Pinger — Advanced tweets, visit pinger.wrioos.com',
            x,
            lineHeight * (lines.length + 3),
            fontSize
          );


          var base64Data = req.rawBody.replace(/^data:image\/png;base64,/, "");

          toDataURL('')
          require("fs").writeFile("out.png", base64Data, 'base64', function(err) {
          console.log(err);
});
          //save(canvas, cb)
        }()
  })
}

window.drawComment = drawComment;

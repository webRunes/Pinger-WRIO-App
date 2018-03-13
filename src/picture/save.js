const
  temp = require('temp');

temp.track();

module.exports = (canvas, cb) =>
  canvas.toBuffer((err, buf) =>
    err
      ? cb(err)
      : //temp.open({suffix: ".png"}, (err, file) =>
          err
            ? cb(err)
            //: fs.writeFile(file.fd, buf, err =>
            : fs.writeFile('a.png', buf, err =>
                cb(err, 'file.path ---> a.png'))
        //)
  )

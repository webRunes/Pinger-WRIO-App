const
  temp = require('temp'),
  fs = require('fs');

temp.track();

module.exports = (buf, cb) =>
  temp.open({suffix: ".png"}, (err, file) =>
    err
      ? cb(err)
      // DEBUG : fs.writeFile('example.png', buf, err =>
      : fs.writeFile(file.fd, buf, err =>
          err
            ? cb(err)
            : cb(null, file.path)
        )
  );

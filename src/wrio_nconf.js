const path = require('path');
const nconf = require('nconf');

nconf.env().argv();

// var basedirPath = path.dirname(require.main.filename); // won't work with unit tests
nconf.file(path.resolve(__dirname, '../config.json'));

module.exports = nconf;

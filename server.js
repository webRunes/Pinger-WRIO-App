try {
 require("babel/register")({
 stage: 0
 });
 } catch (e) {
 console.log("Babel polyfill already loaded, seems to be ok, relaxing....");
 }

var app = require('./src');

module.exports = app;
 
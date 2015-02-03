var express = require('express');
var app = require("./wrio_app.js").init(express);
var server = require('http').createServer(app).listen(5000);
//var Canvas = require('canvas');
var titterPicture = require('./titter-picture');
var titterSender = require('./titter-sender');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

app.get('/', function (request, response) {
	/*
	 gm(200, 400, "#ddff99f3").drawText(10, 50, "from scratch").write("/brandNewImg.jpg", function (err) {
	 console.log(err);
	 });
	 */
	/*
	 var Image = Canvas.Image
	 var canvas = new Canvas(200, 200)
	 var ctx = canvas.getContext('2d');
	 ctx.font = '30px Impact';
	 ctx.fillText("Awesome!", 50, 100);
	 var te = ctx.measureText('Awesome!');
	 ctx.strokeStyle = 'rgba(0,0,0,0.5)';
	 ctx.beginPath();
	 ctx.lineTo(50, 102);
	 ctx.lineTo(50 + te.width, 102);
	 ctx.stroke();

	 var stream = canvas.jpegStream({
	 bufsize: 4096 // output buffer size in bytes, default: 4096
	 , quality: 75 // JPEG quality (0-100) default: 75
	 , progressive: false // true for progressive compression, default: false
	 });

	 stream.on('data', function (chunk) {
	 out.write(chunk);
	 });

	 stream.on('end', function () {
	 console.log('saved png');
	 });
	 */
	response.render('index.ejs');
})

app.post('/sendComment', function (request, response) {
	try {
		/*
		 titterPicture.drawComment(request.body.comment, function (error, image) {
		 image.write('/comment.png', function (error) {
		 console.log(error);
		 });
		 });
		 */
		var message = request.body.comment;
		var imagePath = "images/1.jpg";
		titterSender.comment(message, imagePath);

	} catch (error) {

	} finally {
		response.render('index.ejs');
		response.end()
	}
});
console.log("Application Started!");
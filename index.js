var express = require('express');
var bodyParser = require('body-parser');
var cookieParser = require('cookie-parser');
var session = require('express-session');
var passport = require('passport');

var path = require('path');

var signin = require('./signin');
var models = require('./models');

passport.serializeUser(signin.serialize)
passport.deserializeUser(signin.deserialize(models.User))
passport.use(signin.facebookStrategy(models.User))


var app = express();

app.set('port', process.env.PORT || 5000);

app.use(session({ secret: 'Share Codes' }))
app.use(bodyParser.json())
app.use(bodyParser.urlencoded())
app.use(cookieParser())
app.use(passport.initialize())
app.use(passport.session())
app.use(express.static(path.join(__dirname ,'public')));

app.use('/', function(req, res, next) {
  if (req.user) {
    req.username = req.user.dataValues.lastName
  }
  else {
    req.username = 'Anonymous'
  }
  next()
})

app.get('/', function(req, res) {
  res.render('index.ejs', {
    username: req.username
  });
})

app.get('/auth/facebook', passport.authenticate('facebook', { display: 'popup' }))

app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  failureRedirect: '/',
  successRedirect: '/'
}))

models.sequelize.sync().success(function() {
  app.listen(app.get('port'), function() {
    console.log('Listening, please visit: http://localhost:' + app.get('port') + '/ ...')
  });
})

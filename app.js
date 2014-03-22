/**
 * Module dependencies.
 */

var express = require('express');
var fs = require('fs');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

/**
 * Passport config data
 */

var passport_conf_path = 'passport_config.json',
    passport_conf = {};

if (fs.existsSync(passport_conf_path)) {
  passport_conf = JSON.parse(fs.readFileSync(passport_conf_path));
} else {
  passport_conf = {
    FB_APP_ID: 'your app id',
    FB_APP_SECRET: 'your app secret'
  };
}

/**
 * end of Passport config data
 */


var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(passport.initialize());
app.use(passport.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/**
 * Setup Passport
 */

passport.use(new FacebookStrategy({
  clientID: passport_conf.FB_APP_ID,
  clientSecret: passport_conf.FB_APP_SECRET,
  callbackURL: 'http://localhost:3000/auth/facebook/callback'
}, function (accesToken, refreshToken, profile, done) {
  process.nextTick(function () {
    // Assuming user exists
    done(null, profile);
  });
}));

passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (obj, done) {
  done(null, obj);
});

/**
 * end of Setup Passport
 */

/**
 * Routes
 */

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback', passport.authenticate('facebook', {
  successRedirect: '/success',
  failureRedirect: '/error'
}));

app.get('/success', function (req, res, next) {
  res.send('Succesfully logged in.');
});

app.get('/error', function (req, res, next) {
  res.send('Error logging in.');
});

/**
 * end of Routes
 */

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

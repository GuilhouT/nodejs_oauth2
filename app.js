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
var GitHubStrategy = require('passport-github').Strategy;

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
    FB_APP_SECRET: 'your app secret',

    GH_APP_ID: 'your app id',
    GH_APP_SECRET: 'your app secret'
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
 * Passport setup
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

passport.use(new GitHubStrategy({
  clientID: passport_conf.GH_APP_ID,
  clientSecret: passport_conf.GH_APP_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback'
}, function (accessToken, refreshToken, profile, done) {
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
 * end of Passport setup
 */

/**
 * Routes
 */

app.get('/', routes.index);
app.get('/users', user.list);

app.get('/auth/facebook', passport.authenticate('facebook'));
app.get('/auth/facebook/callback',
  passport.authenticate('facebook'),
  function (req, res) {
    if (!req.user) {
      return res.redirect('/error');
    }
    user.show(req, res);
  }
);

app.get('/auth/github', passport.authenticate('github'));
app.get('/auth/github/callback',
  passport.authenticate('github'),
  function (req, res) {
    if (!req.user) {
      return res.redirect('/error');
    }
    user.show(req, res);
  }
);

app.get('/success', function (req, res, next) {
  res.send('Succesfully logged in.');
});

app.get('/error', function (req, res, next) {
  res.send('Error logging in.');
});

app.get('/profile', user.show);

app.get('/logout', function (req, res, next) {
  req.logout();
  res.send('You have logged out');
});

/**
 * end of Routes
 */

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});

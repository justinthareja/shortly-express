var express = require('express');
var util = require('./lib/utility');
var partials = require('express-partials');
var bodyParser = require('body-parser');
var session = require('express-session');


var db = require('./app/config');
var Users = require('./app/collections/users');
var User = require('./app/models/user');
var Links = require('./app/collections/links');
var Link = require('./app/models/link');
var Click = require('./app/models/click');

var app = express();

app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.use(partials());
// Parse JSON (uniform resource locators)
app.use(bodyParser.json());
// Parse forms (signup/login)
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));
// Enable sessions
app.use(session({
  secret: 'shhhhh don\'t tell',
  resave: false,
  saveUninitialized: true
}));


app.get('/', util.isLoggedIn, function(req, res) {
  res.render('index');
});

app.get('/create', util.isLoggedIn, function(req, res) {
  res.render('index');
});

app.get('/links', util.isLoggedIn, function(req, res) {
  Links.reset().fetch().then(function(links) {
    res.send(200, links.models);
  });
});

app.get('/login', 
function(req, res) {
  res.render('login');
});

app.post('/login', function(req, res) {
  // assign req.session.user to the user associated with the username
  // check if username exists
  var username = req.body.username;
  var password = req.body.password;

  User.forge({username: username}).fetch()
  .then(function(user) {
    if ( !user ) {
      console.log('No username:', username, 'in db');
      res.render('login');
    }
    else {
      user.matchPasswords(password, user.get('password')).then(function (match) {
        console.log('passwords match:', match);
        if ( !match ) {
          res.render('login');
        }
        else {
          util.createSession(req, res, user);
        }
      })
    }
  })
});

app.get('/signup',
  function(req, res) {
    res.render('signup');
});

app.post('/signup', function (req, res) {
  var username = req.body.username;
  var password = req.body.password;

  User.forge({username: username}).fetch().then(function(user) {
    if ( !user ) {
      User.forge({
        username: username,
        password: password
      }).save().then(function(newUser) {
        console.log('New user created:', newUser.attributes);
        res.redirect('/login');
      });
    }
    else {
      console.log('Username already exists');
      res.redirect('/login');
    }
  }); 
});

app.post('/links', 
function(req, res) {
  var uri = req.body.url;

  if (!util.isValidUrl(uri)) {
    console.log('Not a valid url: ', uri);
    return res.send(404);
  }

  new Link({ url: uri }).fetch().then(function(found) {
    if (found) {
      res.send(200, found.attributes);
    } else {
      util.getUrlTitle(uri, function(err, title) {
        if (err) {
          console.log('Error reading URL heading: ', err);
          return res.send(404);
        }

        var link = new Link({
          url: uri,
          title: title,
          base_url: req.headers.origin
        });

        link.save().then(function(newLink) {
          Links.add(newLink);
          res.send(200, newLink);
        });
      });
    }
  });
});

app.get('/logout', function (req, res) {
  console.log('session before destroySession called', req.session.user);
  util.destroySession(req, res);
});
  
/************************************************************/
// Handle the wildcard route last - if all other routes fail
// assume the route is a short code and try and handle it here.
// If the short-code doesn't exist, send the user to '/'
/************************************************************/

app.get('/*', function(req, res) {
  new Link({ code: req.params[0] }).fetch().then(function(link) {
    if (!link) {
      res.redirect('/');
    } else {
      var click = new Click({
        link_id: link.get('id')
      });

      click.save().then(function() {
        db.knex('urls')
          .where('code', '=', link.get('code'))
          .update({
            visits: link.get('visits') + 1,
          }).then(function() {
            return res.redirect(link.get('url'));
          });
      });
    }
  });
});

console.log('Shortly is listening on 4568');
app.listen(4568);

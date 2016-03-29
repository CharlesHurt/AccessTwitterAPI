var express = require('express');
var router = express.Router();

var User = require('../models/user');




router.get('/', function(req, res) {
  User.find({}, function(err, users) {
    res.status(err ? 400 : 200).send(err || users);
  });
});

router.post('/authenticate', function(req, res) {
  User.authenticate(req.body, function(err, token) {
    if (err) {
      res.status(400)
      res.send(err);
    } else {
      res.cookie('CPHCookie', token).send('OK');
    }
  });
});

router.post('/register', function(req, res) {
  User.register(req.body, function(err) {
    res.status(err ? 400 : 200).send(err);
  });
});

// From here down, this is middleware for protected routes
router.use(function(req, res, next) {
  console.log('req.cookies=', req.cookies.CPHCookie);

  try {
    var payload = jwt.decode(req.cookies.CPHCookie, JWT_SECRET)
    User.findById({user:payload.userId}, function(err, user) {
      if (err) {
        console.log("How could this happen? Id authorization failure:", err);
      } else {
        next()
      }
    })
    //
  } catch(e) {
    res.clearCookie('CPHCookie') // Remove a particular cookie
    res.status('401'); // Unauthorized
    res.send(err)
    return
  }
  next()
});

// If we get here the middleware varified we are good to go
router.post('/interest', function(req, res) {

  User.addInterest(req.body, function(err) {
    res.status(err ? 400 : 200).send(err);
  });
});

module.exports = router;

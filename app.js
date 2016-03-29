var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var twitter = require('twitter')
var mongoose = require('mongoose')

const JWT_SECRET = 'CPH SECRET';

const MONGO_URL = process.env.MONGOLAB_URI || 'mongodb://localhost/twitter'

mongoose.connect(MONGO_URL, function(err) {
  if (err) {
    console.log('An error occurred connecting to DB:', err);
  } else {
    console.log('Logged in to DB successfully.');
  }
})


var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

/*
EXPLAINATION OF AUTH PROCESS
First, user registers across HTTPS.
On backend, password is encrypted using bcrypt and never seen again
This is done inside a MODEL method of mongo (v.s. an instance method)
The creation of this method occures prior to the Mongo Schema being compiled
into a formal Model.

The model/user.js code looks like this:
userSchema.statics.register = function(userObj, cb) {
  bcrypt.hash(userObj.password, 10, function(err, hash) {
    if(err) {
      return cb(err);
    }
    User.create({
      username: userObj.username,
      password: hash
    }, function(err) {
      cb(err);
    });
  });
};

Notice that the User.create method compiled the schema and created the Model
in a single step.

POSSIBLE CONFUSION:
Notice that "User" does not appear to exist when User.create is invoked.
That is because, the below statement was executed when the server started up:

User = mongoose.model('User', userSchema);

Long after the User was defined, someone makes a request to register, which
invokes the userSchema.statics.register method

So, once the user has registered, Mongo has a User Entry with the password
encrypted inside.

At some later point, the user will request to login (over https).  He(she or it)
will supply a username and password.  This info will pass through the login
route where it will be used to look up the user in Mongo.  If the user is matched,
then the pwd is sent to bcrypt for comparison.  This is the .compare method which
handles both encrypting the **attempted pwd** with the known pwd.

If this process is successful, a token is created to be used as a "login OK" flag.
The token is an encrypted payload consisting of the username and optionally an
"iat" (Issued At Time). The code looks like this:

var payload = {
  userId: dbUser._id,
  iat: Date.now()  // issued at time
}

// generate a token
var token = jwt.encode(payload, JWT_SECRET);
The "secret" is a term used to make the payload unique, and is only ever held
on the server.

Once this token has been created, the server sends it as a cookie to the client.
Any subsequent **requests** by the client automatically include the cookie, which
essentially acts like a hand stamp at a night club.  "Protected" routes must
include middleware to verify the cookie is good.

*/
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'));



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});


module.exports = app;

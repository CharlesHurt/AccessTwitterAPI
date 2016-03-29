'use strict';

var mongoose = require('mongoose');
var bcrypt = require('bcryptjs');
var jwt = require('jwt-simple');

const JWT_SECRET = 'CPH SECRET';

var User;

var userSchema = new mongoose.Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  interests: { type: [String] }
});

userSchema.statics.authenticate = function(userObj, cb) {
  User.findOne({username: userObj.username}, function(err, dbUser) {
    if(err || !dbUser) {
      return cb("Authentication failed.");
    }
    bcrypt.compare(userObj.password, dbUser.password, function(err, isGood) {
      if (err || !isGood) {
        return cb("Authentication failed.");
      }

      var payload = {
        userId: dbUser._id,
        iat: Date.now()  // issued at time
      };

      // Create a JWT token
      var token = jwt.encode(payload, JWT_SECRET);
      console.log('DEEP Down in model, cookie is:', token);
      cb(null, token);
    });
  });
};

userSchema.statics.addInterest = function(userObj, cb) {
  console.log('userObj is:', userObj);
  User.findOne({username: userObj.username}, (err, dbUser) => {
    if (err) {
      cb(err)
    } else {
      console.log('dbUser:', dbUser);
      if (dbUser.interests.indexOf(userObj.interests) === -1) {
        dbUser.interests.push(userObj.interests)
      }
      cb(null)
    }
  })
}


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

User = mongoose.model('User', userSchema);

module.exports = User;

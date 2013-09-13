var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , bcrypt = require('bcrypt');

var UserSchema = new Schema({
    username: { type: String, required: true, unique: true }
  , salt: { type: String, required: true }
  , hash: { type: String, required: true }
  , isAdmin: { type: Boolean, default: false }
});

UserSchema.virtual('password').get(function () {
  return this._password;
}).set(function (password) {
  this._password = password;
  var salt = this.salt = bcrypt.genSaltSync(10);
  this.hash = bcrypt.hashSync(password, salt);
});

UserSchema.methods.setPassword = function (password, done) {
  var that = this;
  bcrypt.genSalt(10, function(err, salt) {
    bcrypt.hash(password, salt, function(err, hash) {
      that.hash = hash;
      that.salt = salt;
      done(that);
    });
  });
};

UserSchema.method('verifyPassword', function(password, callback) {
  bcrypt.compare(password, this.hash, callback);
});

UserSchema.static('authenticate', function(email, password, callback) {
  this.findOne({ email: email }, function(err, user) {
    if (err) { return callback(err); }
    if (!user) { return callback(null, false); }
    user.verifyPassword(password, function(err, passwordCorrect) {
      if (err) { return callback(err); }
      if (!passwordCorrect) { return callback(null, false); }
      return callback(null, user);
    });
  });
});

module.exports = mongoose.model('User', UserSchema);
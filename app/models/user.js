var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , passportLocalMongoose = require('passport-local-mongoose')

var User = new Schema({
  isAdmin: { type: Boolean, default: false }
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
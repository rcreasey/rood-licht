var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var Setting = Schema({
  key: {type: String, index: true, unique: true},
  value: String
});

module.exports = mongoose.model('Setting', Setting);
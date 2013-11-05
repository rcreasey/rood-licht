var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , _ = require('underscore')

var Setting = Schema({
  key: {type: String, index: true, unique: true},
  value: String
});

Setting.statics.initialize = function (results, callback) {
  settings = {};
  _.map(results, function(setting, value){ return settings[ setting.key ] = setting.value; });
  callback( settings );
}

module.exports = mongoose.model('Setting', Setting);
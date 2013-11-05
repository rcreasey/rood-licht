var locomotive = require('locomotive')
  , async = require('async')
  , _ = require('underscore')
  , Controller = locomotive.Controller
  , SettingsController = new Controller()
  , Settings = require('../models/setting')

SettingsController.index = function(req, res) {
  async.waterfall([
    function(callback) {
      Settings.find({}).sort('key').exec( callback );
    }, function(results, callback) {
      Settings.initialize(results, callback)
    }
  ], function(settings) {
    res.render('settings/index', {title: 'Settings', user: req.user, settings: settings});
  });

};

SettingsController.update = function(req, res) {
  async.forEach(Object.keys(req.body.keys), function(key, callback) {
    Settings.update({key: key}, {$set: {key: key, value: req.body.keys[key]}}, {upsert: true}, callback);
  }, function(err) {
    res.redirect('/settings');
  });

};

module.exports = SettingsController;
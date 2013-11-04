var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , SettingsController = new Controller()
  , Settings = require('../models/setting')

SettingsController.index = function(req, res) {
  Settings.find({}).sort('key').exec(function(err, settings) {
    res.render('settings/index', {title: 'Settings', user: req.user, settings: settings});
  })
};

SettingsController.update = function(req, res) {
  console.log(req.body)
  res.redirect('/settings');
};

module.exports = SettingsController;
var locomotive = require('locomotive')
  , async = require('async')
  , liquid = require('liquid-node')
  , Controller = locomotive.Controller
  , RootController = new Controller()
  , Route = require('../models/route')
  , Settings = require('../models/setting')

RootController.index = function(req, res) {
  async.waterfall([
    function(callback) {
      Settings.find({}).sort('key').exec( callback );
    }, function(results, callback) {
      Settings.initialize(results, callback)
    }
  ], function(settings) {
    Route.find({}).populate('startStation endStation').sort('rate startStation.stationName').exec(function(err, routes) {
      template = liquid.Template.parse(settings.contract_details)
      pricing_layout = template.render( settings )
      pricing_layout.done(function(pricing) {
        res.render('root/index', {title: 'Pricing', user: req.user, pricing_layout: pricing, routes: routes})
      });
    })
  });
};

module.exports = RootController;
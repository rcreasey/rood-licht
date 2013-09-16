var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , RootController = new Controller()
  , Route = require('../models/route')


RootController.index = function(req, res) {
  Route.find({}).populate('startStation endStation').sort('rate').exec(function(err, routes) {
    res.render('root/index', {title: 'Pricing', user: req.user, routes: routes});
  })
};

module.exports = RootController;
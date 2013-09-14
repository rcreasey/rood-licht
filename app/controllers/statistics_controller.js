var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , StatisticsController = new Controller()
  , Contract = require('../models/contract')
  , Station = require('../models/station')

StatisticsController.index = function(req, res) {  

  Contract.find({}).populate('startStation endStation').limit(1).exec(function(err, results) {
    res.render('statistics/index', {title: 'Statistics', user: req.user, results: results});
  });
};

module.exports = StatisticsController;

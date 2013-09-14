var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , StatisticsController = new Controller()
  , Contract = require('../models/contract')

StatisticsController.index = function(req, res) {  

  Contract.find({type: 'Courier'}).sort('-dateIssued').exec(function(err, contracts) {
    res.render('statistics/index', {title: 'Statistics', user: req.user, contracts: contracts});
  });
};

module.exports = StatisticsController;

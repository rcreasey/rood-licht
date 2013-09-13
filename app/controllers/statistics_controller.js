var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , StatisticsController = new Controller()
  , Contract = require('../models/contract')

StatisticsController.index = function() {
  var self = this;
  this.title = 'Statistics';

  Contract.find({type: 'Courier'}).sort('-dateIssued').exec(function(err, contracts) {
    self.contracts = contracts;
    self.render();
  });
};

module.exports = StatisticsController;

var locomotive = require('locomotive')
  , Controller = locomotive.Controller;

var Contract = require('../models/contract');

var ContractsController = new Controller();

ContractsController.index = function() {
  var self = this;
  this.title = 'Contracts';

  Contract.find({type: 'Courier'}).sort('-dateIssued').exec(function(err, contracts) {
    self.contracts = contracts;
    self.render();
  });
};

ContractsController.current = function() {
  var self = this;
  this.title = 'Contracts - In Progress';

  Contract.find({type: 'Courier', $or: [{status: 'Outstanding'}, {status: 'InProgress'}]}).sort('-dateIssued').exec(function(err, contracts) {
    self.contracts = contracts;
    self.render();
  });
};

ContractsController.completed = function() {
  var self = this;
  this.title = 'Contracts - Completed';

  Contract.find({type: 'Courier', $or: [{status: 'Completed'}, {status: 'Rejected'}, {status: 'Deleted'}, {status: 'Failed'}]}).sort('-dateIssued').exec(function(err, contracts) {
    self.contracts = contracts;
    self.render();
  });
};

module.exports = ContractsController;

var locomotive = require('locomotive')
  , Controller = locomotive.Controller

var ContractsController = new Controller();

ContractsController.index = function() {
  this.title = 'contracts';
  this.contracts = [];
  this.render();
};

module.exports = ContractsController;

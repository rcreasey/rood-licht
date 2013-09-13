var locomotive = require('locomotive')
  , Controller = locomotive.Controller

var Contract = require('../models/contract');

var ContractsController = new Controller();

ContractsController.index = function() {
  var self = this;
  this.title = 'Contracts';

  var filters = []
  if ( this.param('filters') ){
    for ( var id in this.param('filters').split(',') ){
      filters.push({status: filters[id]})
      console.log(filters[id])
    }
  } else {
    filters.push({status: 'Outstanding'})
    filters.push({status: 'InProgress'})
  }

  Contract.find({$or: filters}).sort('-dateIssued').exec(function(err, contracts) {
    self.contracts = contracts;
    self.render();
  });
};


// ContractsController.completed = function() {
//   var self = this;
//   this.title = 'Contracts - Completed';

//   Contract.find({type: 'Courier', $or: [{status: 'Completed'}, {status: 'Rejected'}, {status: 'Deleted'}, {status: 'Failed'}]}).sort('-dateIssued').exec(function(err, contracts) {
//     self.contracts = contracts;
//     self.render();
//   });
// };

module.exports = ContractsController;

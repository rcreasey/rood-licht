var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , ContractsController = new Controller()
  , Contract = require('../models/contract')

ContractsController.index = function(req, res) {  
  var self = this;
  this.title = 'Contracts';

  var filters = []
  // if ( this.param('filters') ){
  //   for ( var id in this.param('filters').split(',') ){
  //     filters.push({status: filters[id]})
  //     console.log(filters[id])
  //   }
  // } else {
  filters.push({status: 'Outstanding'});
  filters.push({status: 'InProgress'});
  // }

  Contract.find({$or: filters}).sort('-dateIssued').exec(function(err, contracts) {
    res.render('contracts/index', {contracts: contracts});
  });
};

module.exports = ContractsController;

var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , ContractsController = new Controller()
  , Contract = require('../models/contract')
  , moment = require('moment')

ContractsController.index = function(req, res) {
  var filters = [];

  switch(req.param('filter')) {
    case 'outstanding':
      filters.push({status: 'Outstanding'});
      break;
    case 'inprogress':
      filters.push({status: 'InProgress'});
      break;
    case 'completed':
      filters.push({status: 'Completed'});
      break;
    case 'failed':
      filters.push({status: 'Failed'});
      break;
    case 'rejected':
      filters.push({status: 'Rejected'});
      break;
    case 'cancelled':
      filters.push({status: 'Cancelled'});
      break;
    default:
      filters.push({status: 'Outstanding'});
      filters.push({status: 'InProgress'});
  }

  Contract.find({$or: filters, dateIssued: { $lt: moment(), $gt: moment().subtract('week', 2)._d }}).populate('startStation endStation').sort('-dateIssued').exec(function(err, contracts) {
    res.render('contracts/index', {title: 'Contracts', user: req.user, filter: req.param('filter') || 'current', contracts: contracts});
  });
};

module.exports = ContractsController;

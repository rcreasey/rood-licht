var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , StatisticsController = new Controller()
  , async = require('async')
  , Contract = require('../models/contract')
  , Station = require('../models/station')

StatisticsController.index = function(req, res) {  
  var locals = {title: 'Statistics', user: req.user, inbound: [], outbound: []};

  async.parallel([
    function(callback) {

      // Sum volume by endStation (inbound)
      async.waterfall([
        function(callback) {
          Contract.aggregate(
              { $match: { status: 'Outstanding' }}
            , { $group: { _id: '$endStation', volume: { $sum: '$volume' } }}
            , { $sort: { volume: -1} }
            , callback
          );
        },
        function(contracts, callback) {
          async.forEach(contracts, function(contract, callback) {
            Station.findOne({_id: contract._id}, function( e, station ) {
              contract.endStation = station;
              callback();
            });
          }, function(err) {
            locals.inbound = contracts;
            callback();
          });
        }
      ], function() {
        callback();
      });

    },
    function(callback) {

      // Sum volume by startStation (outbound)
      async.waterfall([
        function(callback) {
          Contract.aggregate(
              { $match: { status: 'Outstanding' }}
            , { $group: { _id: '$startStation', volume: { $sum: '$volume' } }}
            , { $sort: { volume: -1} }
            , callback
          );
        },
        function(contracts, callback) {
          async.forEach(contracts, function(contract, callback) {
            Station.findOne({_id: contract._id}, function( e, station ) {
              contract.startStation = station;
              callback();
            });
          }, function(err) {
            locals.outbound = contracts;
            callback();
          });
        }
      ], function() {
        callback();
      });

    }
  ], function(err) {
    res.render('statistics/index', locals);
  });

};

module.exports = StatisticsController;

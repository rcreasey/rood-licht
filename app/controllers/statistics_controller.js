var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , StatisticsController = new Controller()
  , async = require('async')
  , moment = require('moment')
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

StatisticsController.volume = function(req, res) {
  var duration = req.param('duration') || 'daily';
  var fill     = "rgba(151,187,205,0.5)";
  var stroke   = "rgba(151,187,205,1)";

  switch(duration) {
    case 'hourly':
      var start = moment().subtract('day', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day", hour: "$_id.hour"};
      var label = "contract._id.month + '/' + contract._id.day";
      break;
    case 'daily':
      var start = moment().subtract('week', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
      break;
    case 'weekly':
      var start = moment().subtract('week', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
      break;
    case 'monthly':
      var start = moment().subtract('month', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
      break;
    case 'yearly':
      var start = moment().subtract('year', 100)._d;
      var match = {year: "$_id.year"};
      var label = "contract._id.month + '/' + contract._id.day";
      break;
    default:
      var start = moment().subtract('day', 31)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day", hour: "$_id.hour"};
      var label = "contract._id.month + '/' + contract._id.day";
  }
  
  Contract.aggregate(
      { $match: { status: 'Completed', dateIssued: {$gte: start} }}
    , { $project: { 
            _id: {
                year : { $year : "$dateIssued" }
              , month : { $month : "$dateIssued" }
              , day : { $dayOfMonth : "$dateIssued" }
              , hour : { $hour : "$dateIssued" }
            }
          , status: 1
          , volume: 1
      }}
    , { $group: { _id: match, volume: {$sum: "$volume"}}}
    , { $sort : { _id : 1 }}
    , function(err, contracts) {
      var labels = new Array
        , data = new Array;

      for( id in contracts ) {
        var contract = contracts[id];
        labels.push( eval(label) );
        data.push( parseInt(contract.volume) );
      }

      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/volume', {title: 'Statistics :: Volume', user: req.user, duration: duration, results: JSON.stringify(results) });
    }
  );

};

module.exports = StatisticsController;

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
  var duration = req.param('duration') || 'weekly';
  var fill     = "#fcf8e3";
  var stroke   = "#fbeed5";
  var start, match, label;

  switch(duration) {
    case 'daily':
      var start = moment().subtract('week', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
      break;
    case 'weekly':
      var start = moment().subtract('days', 31.5)._d;
      var match = {year: "$_id.year", week: "$_id.week"};
      var label = "'Week ' + contract._id.week";
      break;
    case 'monthly':
      var start = moment().subtract('days', 365)._d;
      var match = {year: "$_id.year", month: "$_id.month"};
      var label = "contract._id.month + '/' + contract._id.year";
      break;
    case 'yearly':
      var start = moment().subtract('year', 3)._d;
      var match = {year: "$_id.year"};
      var label = "contract._id.year";
      break;
    default:
      var start = moment().subtract('week', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
  }
  
  Contract.aggregate(
      { $match: { status: 'Completed', dateCompleted: {$gte: start} }}
    , { $project: { 
            _id: {
                year : { $year : "$dateCompleted" }
              , month : { $month : "$dateCompleted" }
              , day : { $dayOfMonth : "$dateCompleted" }
              , week : { $week : "$dateCompleted" }
              , hour : { $hour : "$dateCompleted" }
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
        labels.push( String(eval(label)) );
        data.push( parseInt(contract.volume) );
      }

      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/volume', {title: 'Statistics :: Volume', user: req.user, duration: duration, results: JSON.stringify(results) });
    }
  );

};

StatisticsController.reward = function(req, res) {
  var duration = req.param('duration') || 'weekly';
  var fill     = "#dff0d8";
  var stroke   = "#d6e9c6";
  var start, match, label;

  switch(duration) {
    case 'daily':
      var start = moment().subtract('week', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
      break;
    case 'weekly':
      var start = moment().subtract('days', 31.5)._d;
      var match = {year: "$_id.year", week: "$_id.week"};
      var label = "'Week ' + contract._id.week";
      break;
    case 'monthly':
      var start = moment().subtract('days', 365)._d;
      var match = {year: "$_id.year", month: "$_id.month"};
      var label = "contract._id.month + '/' + contract._id.year";
      break;
    case 'yearly':
      var start = moment().subtract('year', 3)._d;
      var match = {year: "$_id.year"};
      var label = "contract._id.year";
      break;
    default:
      var start = moment().subtract('week', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
  }
  
  Contract.aggregate(
      { $match: { status: 'Completed', dateCompleted: {$gte: start} }}
    , { $project: { 
            _id: {
                year : { $year : "$dateCompleted" }
              , month : { $month : "$dateCompleted" }
              , day : { $dayOfMonth : "$dateCompleted" }
              , week : { $week : "$dateCompleted" }
              , hour : { $hour : "$dateCompleted" }
            }
          , status: 1
          , reward: 1
      }}
    , { $group: { _id: match, reward: {$sum: "$reward"}}}
    , { $sort : { _id : 1 }}
    , function(err, contracts) {
      var labels = new Array
        , data = new Array;

      for( id in contracts ) {
        var contract = contracts[id];
        labels.push( String(eval(label)) );
        data.push( parseInt(contract.reward) );
      }

      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/reward', {title: 'Statistics :: Reward', user: req.user, duration: duration, results: JSON.stringify(results) });
    }
  );

};

StatisticsController.failed = function(req, res) {
  var duration = req.param('duration') || 'weekly';
  var fill     = "#f2dede";
  var stroke   = "#eed3d7";
  var start, match, label;

  switch(duration) {
    case 'daily':
      var start = moment().subtract('week', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
      break;
    case 'weekly':
      var start = moment().subtract('days', 31.5)._d;
      var match = {year: "$_id.year", week: "$_id.week"};
      var label = "'Week ' + contract._id.week";
      break;
    case 'monthly':
      var start = moment().subtract('days', 365)._d;
      var match = {year: "$_id.year", month: "$_id.month"};
      var label = "contract._id.month + '/' + contract._id.year";
      break;
    case 'yearly':
      var start = moment().subtract('year', 3)._d;
      var match = {year: "$_id.year"};
      var label = "contract._id.year";
      break;
    default:
      var start = moment().subtract('week', 1)._d;
      var match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      var label = "contract._id.month + '/' + contract._id.day";
  }
  
  Contract.aggregate(
      { $match: { status: 'Failed', dateExpired: {$gte: start} }}
    , { $project: { 
            _id: {
                year : { $year : "$dateExpired" }
              , month : { $month : "$dateExpired" }
              , day : { $dayOfMonth : "$dateExpired" }
              , week : { $week : "$dateExpired" }
              , hour : { $hour : "$dateExpired" }
            }
          , status: 1
          , reward: 1
      }}
    , { $group: { _id: match, reward: {$sum: "$reward"}}}
    , { $sort : { _id : 1 }}
    , function(err, contracts) {
      var labels = new Array
        , data = new Array;

      for( id in contracts ) {
        var contract = contracts[id];
        labels.push( String(eval(label)) );
        data.push( parseInt(contract.reward) );
      }
      console.log(contracts)
      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/failed', {title: 'Statistics :: Failed', user: req.user, duration: duration, results: JSON.stringify(results) });
    }
  );

};

module.exports = StatisticsController;

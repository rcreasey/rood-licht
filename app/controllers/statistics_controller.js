var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , StatisticsController = new Controller()
  , async = require('async')
  , moment = require('moment')
  , _ = require('underscore')
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

Number.prototype.mod = function(n) {
  return ((this%n)+n)%n;
};

var graph_constraints = function(duration) {
  var start, match, format_data;

  switch(duration) {
    case 'daily':
      start = moment().subtract('week', 1)._d;
      match = {year: "$_id.year", month: "$_id.month", day: "$_id.day"};
      format_data = function(contracts) {
        var labels = new Array;
        var data   = new Array;
        var period_length = 14;
        var period_end   = moment()._d.getDate();
        var period_start = period_end - period_length;

        for ( var index = period_start; index <= period_end; index++ ){
          var date = moment().subtract('day', period_end - index);
          var contract = _.find(contracts, function(c) { return c._id.day == index; })  || 
                               {_id: {year: date.year(), month: date.month() + 1, day: date._d.getDate()}, value: 0};

          labels.push( String( contract._id.month + '/' + contract._id.day ) );
          data.push( parseInt( contract.value ) );
        }

        return {labels: labels, data: data};
      };
      break;
    case 'monthly':
      start = moment().subtract('days', 365)._d;
      match = {year: "$_id.year", month: "$_id.month"};
      format_data = function(contracts) {
        var labels = new Array;
        var data   = new Array;
        var period_length = 6;
        var period_end   = moment().month() + 1;
        var period_start = period_end - period_length;

        for ( var index = period_start; index <= period_end; index++ ){
          var date = moment().subtract('month', period_end - index);
          var contract = _.find(contracts, function(c) { return c._id.month == index; }) || 
                               {_id: {year: date.year(), month: date.month() + 1, day: date._d.getDate()}, value: 0};

          labels.push( String( contract._id.month + '/' + contract._id.year ) );
          data.push( parseInt( contract.value ) );
        }

        return {labels: labels, data: data};
      };
      break;
    case 'yearly':
      start = moment().subtract('year', 3)._d;
      match = {year: "$_id.year"};
      format_data = function(contracts) {
        var labels = new Array;
        var data   = new Array;
        var period_length = 3;
        var period_end   = moment().year();
        var period_start = period_end - period_length;

        for ( var index = period_start; index <= period_end; index++ ){
          var contract = _.find(contracts, function(c) { return c._id.year == index; }) || 
                               {_id: {year: index}, value: null};

          labels.push( String( contract._id.year ) );
          data.push( parseInt( contract.value || 0) );
        }

        return {labels: labels, data: data};
      };
      break;
    case 'weekly':
    default:
      start = moment().subtract('days', 31.5)._d;
      match = {year: "$_id.year", week: "$_id.week"};
      format_data = function(contracts) {
        var labels = new Array;
        var data   = new Array;
        var period_length = 10;
        var period_end   = moment().week() - 1;
        var period_start = period_end - period_length;

        for ( var index = period_start; index <= period_end; index++ ){
          var date = moment().subtract('week', period_end - index);
          var contract = _.find(contracts, function(c) { return c._id.week == index; }) || 
                               {_id: {year: date.year(), month: date.month() + 1, day: date._d.getDate(), week: date.week()}, value: 0};

          labels.push( String( 'Week ' + contract._id.week ) );
          data.push( parseInt( contract.value ) );
        }

        return {labels: labels, data: data};
      };
      break;
  };

  return {start: start, match: match, format_data: format_data};
}

StatisticsController.volume = function(req, res) {
  var duration = req.param('duration') || 'weekly';
  var fill     = "#fcf8e3";
  var stroke   = "#fbeed5";

  constraints = graph_constraints( duration );
  var start = constraints.start;
  var match = constraints.match;
  var format_data = constraints.format_data;

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
    , { $group: { _id: match, value: {$sum: "$volume"}}}
    , { $sort : { _id : 1 }}
    , function(err, contracts) {
      var formatted_data = format_data( contracts );
      var labels = formatted_data.labels
        , data = formatted_data.data;

      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/volume', {title: 'Statistics :: Volume', user: req.user, duration: duration, results: JSON.stringify(results), contracts: contracts });
    }
  );

};

StatisticsController.reward = function(req, res) {
  var duration = req.param('duration') || 'weekly';
  var fill     = "#dff0d8";
  var stroke   = "#d6e9c6";
  var start, match, label;

  constraints = graph_constraints( duration );
  var start = constraints.start;
  var match = constraints.match;
  var format_data = constraints.format_data;
  
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
    , { $group: { _id: match, value: {$sum: "$reward"}}}
    , { $sort : { _id : 1 }}
    , function(err, contracts) {
      var formatted_data = format_data( contracts );
      var labels = formatted_data.labels
        , data = formatted_data.data;

      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/reward', {title: 'Statistics :: Reward', user: req.user, duration: duration, results: JSON.stringify(results), contracts: contracts });
    }
  );

};

StatisticsController.tips = function(req, res) {
  var duration = req.param('duration') || 'weekly';
  var fill     = "#5bc0de";
  var stroke   = "#46b8da";
  var start, match, label;

  constraints = graph_constraints( duration );
  var start = constraints.start;
  var match = constraints.match;
  var format_data = constraints.format_data;
  
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
          , delta: 1
      }}
    , { $group: { _id: match, value: {$sum: "$delta"}}}
    , { $sort : { _id : 1 }}
    , function(err, contracts) {
      var formatted_data = format_data( contracts );
      var labels = formatted_data.labels
        , data = formatted_data.data;

      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/tips', {title: 'Statistics :: Tips', user: req.user, duration: duration, results: JSON.stringify(results), contracts: contracts });
    }
  );

};

StatisticsController.failed = function(req, res) {
  var duration = req.param('duration') || 'weekly';
  var fill     = "#f2dede";
  var stroke   = "#eed3d7";
  var start, match, label;

  constraints = graph_constraints( duration );
  var start = constraints.start;
  var match = constraints.match;
  var format_data = constraints.format_data;
  
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
    , { $group: { _id: match, value: {$sum: 1}}}
    , { $sort : { _id : 1 }}
    , function(err, contracts) {
      var formatted_data = format_data( contracts );
      var labels = formatted_data.labels
        , data = formatted_data.data;

      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/failed', {title: 'Statistics :: Failed', user: req.user, duration: duration, results: JSON.stringify(results), contracts: contracts });
    }
  );

};

StatisticsController.rejected = function(req, res) {
  var duration = req.param('duration') || 'weekly';
  var fill     = "#f2dede";
  var stroke   = "#eed3d7";
  var start, match, label;

  constraints = graph_constraints( duration );
  var start = constraints.start;
  var match = constraints.match;
  var format_data = constraints.format_data;
  
  Contract.aggregate(
      { $match: { status: 'Rejected', dateIssued: {$gte: start} }}
    , { $project: { 
            _id: {
                year : { $year : "$dateIssued" }
              , month : { $month : "$dateIssued" }
              , day : { $dayOfMonth : "$dateIssued" }
              , week : { $week : "$dateIssued" }
              , hour : { $hour : "$dateIssued" }
            }
          , status: 1
          , value: 1
      }}
    , { $group: { _id: match, value: {$sum: 1}}}
    , { $sort : { _id : 1 }}
    , function(err, contracts) {
      var formatted_data = format_data( contracts );
      var labels = formatted_data.labels
        , data = formatted_data.data;

      var results = {labels: labels, datasets: [{ fillColor: fill, strokeColor: stroke, data: data }]};
      res.render('statistics/rejected', {title: 'Statistics :: Rejected', user: req.user, duration: duration, results: JSON.stringify(results), contracts: contracts });
    }
  );

};

module.exports = StatisticsController;

var locomotive = require('locomotive')
  , async = require('async')
  , _ = require('underscore')
  , Controller = locomotive.Controller
  , RoutesController = new Controller()
  , Route = require('../models/route')
  , Station = require('../models/station')

RoutesController.index = function(req, res) {
  var self = this;
  Route.find({}).populate('startStation endStation').sort('-rate startStation.stationName').exec(function(err, routes) {
    res.render('routes/index', { title: 'Routes', user: req.user, routes: routes });

  });
};

RoutesController.new = function(req, res) {
  var route = new Route();
  route.startStation = {startStationName: 'Station Name'};
  route.endStation = {endStationName: 'Station Name'};

  Station.find({}).sort('stationName').exec(function(err, stations) {
    var station_data = _.map(stations, function(station) { return station.stationName });
    res.render('routes/new', { title: 'Routes :: Create Route', user: req.user, route: route, stations: JSON.stringify(station_data) });
  });

};

RoutesController.create = function(req, res) {
  var route = new Route({rate: req.body.rate});

  var self = this;
  Station.find({$or: [{stationName: req.body.startStationName}, {stationName: req.body.endStationName}]}).exec(function(err, stations) {
    for (id in stations) {
      if ( stations[id].stationName == req.body.startStationName ) {
        route.startStation = stations[id]._id;
      } else if (stations[id].stationName == req.body.endStationName) {
        route.endStation = stations[id]._id;
      }
    }

    route.save(function(err) {
      if (err)
        res.redirect('/routes/new');

      res.redirect('/routes');
    });
  });

};

RoutesController.destroy = function (req, res) {
  var self = this;
  Route.findOne({_id: req.body.id }).exec(function(err, route) {
    route.remove(function(err) {
      if (err)
        res.send(err);

      res.redirect('/routes');
    });
  });
};

module.exports = RoutesController;
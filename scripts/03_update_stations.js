var async = require('async')
  , eveapi = require('hamster')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps

var Contract = require(root + '/app/models/contract')
  , Station = require(root + '/app/models/station')

// mongoose.set('debug', true)

mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;

var count = 0;
eveapi.setParams({keyID: process.env.EVE_KEYID, vCode: process.env.EVE_VCODE });

// update stations
console.log('-----> Updating Stations');
async.waterfall([
  function(cb) {
    Contract.find({$or: [{startStation: null}, {endStation: null}]}, {"_id": 1, "startStationID": 1, "endStationID": 1, "startStation": 1, "endStation": 1}, cb);
  },
  function(contracts, cb) {
    async.forEach(contracts, function(contract, callback) {
      var startStation, endStation;

      async.parallel([
          // lookup start station
          function(callback) {
            Station.findOne({stationID: contract.startStationID}, function(err, station) { 
              if (err) return callback(err);
              startStation = station
              callback();
            });
          },
          // lookup end station
          function(callback) {
            Station.findOne({stationID: contract.endStationID}, function(err, station) { 
              if (err) return callback(err);
              endStation = station
              callback();
            });
          }
      ], function(err) {
        if (err) return next(err);

        Contract.update({_id: contract._id}, {$set: {startStation: startStation, endStation: endStation}}, callback);
        count += 1;
        process.stdout.write('.');
      });

    }, function(err) {
      if (err) return next(err);
      cb();
    });
  }
], function() {
  console.log('');
  console.log('       %s Stations Updated', count);
  mongoose.disconnect();
});

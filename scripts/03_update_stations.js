var async = require('async')
  , eveapi = require('hamster')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps

var Contract = require(root + '/app/models/contract');
// mongoose.set('debug', true)

mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;

var count = 0;
eveapi.setParams({keyID: process.env.EVE_KEYID, vCode: process.env.EVE_VCODE });

var static_station_lookup = function (stationID) {
  switch(stationID) {
    case 60003760:
      return 'Jita 4-4 - CNAP';
    case 61000299:
      return 'MZ1E-P IX';
    case 61000005:
      return 'JU-OWQ VII';
    case 60014945:
      return '1DH-SX III';
    case 61000854:
      return '4-EP12 VIII';
    case 60012334:
      return 'Jan VI - Moon 21';
    case 60014917:
      return 'VFK-IV VI';
    case 61000358:
      return '85-B52 IV';
    case 61000827:
      return 'E-FIC0 I';
    case 61000166:
      return 'S-DN5M IX';
    default:
      return stationID;
  }
}

// update stations
console.log('-----> Updating Stations');
async.waterfall([
  function(cb) {
    Contract.find({$or: [{startStationName: null}, {endStationName: null}]}, {"_id": 1, "startStationID": 1, "endStationID": 1, "startStationName": 1, "endStationName": 1, "startSolarSystemID": 1, "endSolarSystemID": 1}, cb);
  },
  function(contracts, cb) {
    async.forEach(contracts, function(contract, callback) {

      async.waterfall([
        function(eve_callback) {
          eveapi.fetch('eve:ConquerableStationList', {}, eve_callback);
        },
        function(result, update_callback) {
          var start_station, start_system, end_station, end_system;

          if ( result.outposts[contract.startStationID] !== undefined ) {
            start_station = result.outposts[contract.startStationID].stationName;
            start_system = result.outposts[contract.startStationID].solarSystemID;
          } else {
            start_station = static_station_lookup(contract.startStationID)
            start_system  = 0
          }

          if ( result.outposts[contract.endStationID] ) {
            end_station = result.outposts[contract.endStationID].stationName;
            end_system = result.outposts[contract.endStationID].solarSystemID;        
          } else {
            end_station = static_station_lookup(contract.endSystemID)
            end_system  = 0
          }

          update = {startStationName: start_station, startSolarSystemID: start_system, endStationName: end_station, endSolarSystemID: end_system}
          Contract.update({_id: contract._id}, {$set: update}, update_callback);

          count += 1
          process.stdout.write('.');
        }
      ], function() {
        callback();
      });

    }, function(err) {
      if (err) return next(err);
      cb();
    });
  }
], function() {
  console.log('')
  console.log('       %s Stations Updated', count);
  mongoose.disconnect();
});

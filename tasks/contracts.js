var async = require('async')
  , eveapi = require('hamster')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps

var Contract = require(root + '/app/models/contract')
  , Station = require(root + '/app/models/station')
  , Route    = require(root + '/app/models/route')

mongoose.set('debug', true)

'use strict';

module.exports = function(grunt) {
  grunt.registerTask('fetch_contracts', 'Fetches contracts from CCP EVEOnline API.', function() {

    mongoose.connect(process.env.MONGO_URL);
    var db = mongoose.connection;
    var callback = this.async();
    var count = 0;

    eveapi.setParams({keyID: process.env.EVE_KEYID, vCode: process.env.EVE_VCODE });

    eveapi.fetch('corp:Contracts', {}, function (err, result) {
      if (err) throw err;

      grunt.log.write('-----> Fetching Contracts\n');
      for (contractID in result.contractList) {
        contract = result.contractList[ contractID ];
        if(contract.type == 'Courier') {
          Contract.update({contractID: contractID}, {$set: contract}, {upsert: true}, function(err){ throw err });

          count += 1;
          grunt.verbose.write('.');
        }
      }

      grunt.verbose.write('\n')
      grunt.log.write('       %s Contracts Updated: ', count);
      mongoose.disconnect();
      grunt.log.ok();
      callback();
    });

    return true;
  });

  grunt.registerTask('update_issuers', 'Updates Issuers and Issuer Corps from CCP EVEOnline API.', function() {

    mongoose.connect(process.env.MONGO_URL);
    var db = mongoose.connection;
    var callback = this.async();
    var count = 0;

    eveapi.setParams({keyID: process.env.EVE_KEYID, vCode: process.env.EVE_VCODE });

    grunt.log.write('-----> Fetching Unset Issuers\n');
    async.waterfall([
      function(callback) {
        Contract.find({$or: [{issuerName: null}, {issuerCorpName: null}]}, {"_id": 1, "issuerID": 1, "issuerName": 1, "issuerCorpID": 1, "issuerCorpName": 1, "forCorp": 1}, callback);
      },
      function(contracts, callback) {
        async.forEach(contracts, function(contract, callback) {

          async.waterfall([
            function(eve_callback) {
              eveapi.fetch('eve:CharacterName', {ids: contract.issuerID + ',' + contract.issuerCorpID}, eve_callback);
            },
            function(result, update_callback) {
              corp_name = result.characters[contract.issuerCorpID].name;
              char_name = result.characters[contract.issuerID].name;
              Contract.update({_id: contract._id}, {$set: {issuerName: char_name, issuerCorpName: corp_name}}, update_callback);

              count += 1;
              grunt.verbose.write('.');
            }
          ], function() {
            callback();
          });

        }, function(err) {
          if (err) return next(err);
          callback();
        });
      }
    ], function() {
      grunt.verbose.write('\n')
      grunt.log.write('       %s Issuers Updated: ', count);
      mongoose.disconnect();
      grunt.log.ok();
      callback();
    });

    return true;
  });

  grunt.registerTask('update_stations', 'Updates start/end stations on contracts.', function() {

    mongoose.connect(process.env.MONGO_URL);
    var db = mongoose.connection;
    var callback = this.async();
    var count = 0;

    grunt.log.write('-----> Updating Stations\n');
    async.waterfall([
      function(callback) {
        Contract.find({$or: [{startStation: null}, {endStation: null}]}, {"_id": 1, "startStationID": 1, "endStationID": 1, 
                                                                                    "startStation": 1, "endStation": 1}, callback);
      },
      function(contracts, callback) {
        async.forEach(contracts, function(contract, callback) {
          var startStation, endStation;

          async.parallel([
              function(callback) {
                Station.findOne({stationID: contract.startStationID}, function(err, station) { 
                  if (err) return callback(err);
                  startStation = station
                  callback();
                });
              },
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
            grunt.verbose.write('.');
          });

        }, function(err) {
          if (err) return next(err);
          callback();
        });
      }
    ], function() {
      grunt.verbose.write('\n')
      grunt.log.write('       %s Stations Updated: ', count);
      mongoose.disconnect();
      grunt.log.ok();
      callback();
    });

    return true;
  });

  grunt.registerTask('validate_contracts', 'Validates contracts.', function() {

    mongoose.connect(process.env.MONGO_URL);
    var db = mongoose.connection;
    var callback = this.async();
    var count = 0;

    grunt.log.write('-----> Validating Contracts\n');
    async.waterfall([
      function(callback) {
        Contract.find({is_valid: null}, {"_id": 1, "startStation": 1, "endStation": 1, 
                                                   "issuerID": 1, "issuerCorpID": 1, "volume": 1, "reward": 1, "delta": 1, 
                                                   "is_valid": 1, "note": 1}).populate('startStation endStation').exec(callback);
      },
      function(contracts, callback) {
        async.forEach(contracts, function(contract, callback) {

          async.waterfall([
            function(callback) {
              Route.findOne({$or: [{startStation: contract.startStation, endStation: contract.endStation},
                                   {startStation: contract.endStation, endStation: contract.startStation}]}).populate('startStation endStation').exec(function(err, route) {
                if (err) return callback(err);
                callback(err, route);
              });
            }
          ], function(err, route) {
            if (err) return callback(err);

            if (route) {
              var price = contract.volume * route.rate;
              contract.delta = contract.reward - price;

              if (contract.delta >= 0) {
                contract.is_valid = true;
                if (contract.delta == 0) contract.note = "No Tip";
              } else {
                // check for preferred customers
                // Starfsckers: 98229193
                // Jbeth: 214707817
                // Inga: 1670860249
                // Viveka: 263514943
                // This should check against an external array.
                if ( contract.issuerID == 214707817 ||
                     contract.issuerID == 1670860249 ||
                     contract.issuerID == 263514943 || 
                     contract.issuerCorpID == 98229193) {
                  contract.is_valid = true;
                  contract.note = "Preferred Customer";
                } else {
                  contract.is_valid = false;
                  contract.note = "Inadequate Reward";
                }
              }
            } else {
              contract.is_valid = false;
              contract.note = "Invalid Route";
            }

            contract.save(callback);

            count += 1;
            grunt.verbose.write('.');
          });

        }, function(err, route, contract) {
          if (err) throw err;
          callback();
        });
      }
    ], function() {
      grunt.verbose.write('\n')
      grunt.log.write('       %s Contracts Validated: ', count);
      mongoose.disconnect();
      grunt.log.ok();
      callback();
    });

    return true;
  });

};


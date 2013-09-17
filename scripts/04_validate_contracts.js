var async = require('async')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps

var Contract = require(root + '/app/models/contract')
  , Station  = require(root + '/app/models/station')
  , Route    = require(root + '/app/models/route')

// mongoose.set('debug', true);

mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;

var count = 0;

// update stations
console.log('-----> Validating Contracts');
async.waterfall([
  function(callback) {
    Contract.find({is_valid: null}, {"_id": 1, "startStation": 1, "endStation": 1, "issuerID": 1, "issuerCorpID": 1, "volume": 1, "reward": 1, "delta": 1, "is_valid": 1, "note": 1}).populate('startStation endStation').exec(callback);
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
        process.stdout.write('.');
      });

    }, function(err, route, contract) {
      if (err) throw err;

      callback();
    });
  }
], function() {
  console.log('');
  console.log('       %s Contracts Checked', count);
  mongoose.disconnect();
});

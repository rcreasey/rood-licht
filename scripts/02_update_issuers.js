var async = require('async')
  , eveapi = require('hamster')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps
  , restClient = require('node-rest-client').Client

var Contract = require(root + '/app/models/contract');
// mongoose.set('debug', true)

mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;

var count = 0;
eveapi.setParams({keyID: process.env.EVE_KEYID, vCode: process.env.EVE_VCODE });

// update contracts with no issuer set
console.log('-----> Updating Issuers');
async.waterfall([
  function(cb) {
    Contract.find({$or: [{issuerName: null}, {issuerCorpName: null}]}, {"_id": 1, "issuerID": 1, "issuerName": 1, "issuerCorpID": 1, "issuerCorpName": 1, "forCorp": 1}, cb);
  },
  function(contracts, cb) {
    async.forEach(contracts, function(contract, callback) {

      async.waterfall([
        function(eve_callback) {
          eveapi.fetch('eve:CharacterName', {ids: contract.issuerID + ',' + contract.issuerCorpID}, eve_callback);
        },
        function(result, update_callback) {
          corp_name = result.characters[contract.issuerCorpID].name;
          char_name = result.characters[contract.issuerID].name;
          Contract.update({_id: contract._id}, {$set: {issuerName: char_name, issuerCorpName: corp_name}}, update_callback);

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
  console.log('       %s Issuers Updated', count);
  mongoose.disconnect();
});

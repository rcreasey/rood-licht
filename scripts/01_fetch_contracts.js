var eveapi = require('hamster')
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

// update contracts from eve online api
eveapi.fetch('corp:Contracts', {}, function (err, result) {
  if (err) throw err;

  console.log('-----> Fetching Contracts');
  for (contractID in result.contractList) {
    contract = result.contractList[ contractID ];
    if(contract.type == 'Courier') {
      Contract.update({contractID: contractID}, {$set: contract}, {upsert: true}, function(err){ throw err });

      count += 1;
      process.stdout.write('.');
    }
  }

  console.log('');
  console.log('       %s Contracts Updated', count);
  mongoose.disconnect();
});


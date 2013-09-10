var hamster  = require('hamster')
  , mongoose = require('mongoose')
  , root     = require('path').normalize(__dirname)
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps

mongoose.connect(process.env.MONGO_URL);

var db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function callback () {
  var Contract = require(root + '/app/models/contract');

  hamster.setParams({
    keyID: process.env.EVE_KEYID,
    vCode: process.env.EVE_VCODE
  });

  console.log('--> Fetching Contracts:')
  hamster.fetch('corp:Contracts', {}, function (err, result) {
    if (err) throw err;

    for (contractID in result.contractList) {
      process.stdout.write(".");
      contract = result.contractList[ contractID ];
      Contract.update({contractID: contractID}, {$set: contract}, {upsert: true}, function(err){ throw err });
    }
    console.log('');
    // console.log('--> Processing Contracts:')

    console.log('--> Contracts updated.')
    mongoose.disconnect();

  });

});


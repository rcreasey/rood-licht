var eveapi = require('hamster')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps
  , moment = require('moment')

var Contract = require(root + '/app/models/contract');
// mongoose.set('debug', true)

mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;

var count = 0;

console.log('-----> Seeding An Old Contract');
var contract = new Contract();
contract.contractID = 0;
contract.status = 'Completed';
contract.type   = 'Courier';
contract.dateCompleted = moment().subtract('year', 1)._d;
contract.volume = 0;
contract.save(function(err) { if (err) console.log(err); });
count += 1;

console.log('');
console.log('       %s Old Contracts Seeded', count);
mongoose.disconnect();

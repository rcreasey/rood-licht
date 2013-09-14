var eveapi = require('hamster')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps

var Station = require(root + '/app/models/station');
// mongoose.set('debug', true)

mongoose.connect(process.env.MONGO_URL);
var db = mongoose.connection;

var count = 0;

// update outposts from eve online api
eveapi.fetch('eve:ConquerableStationList', {}, function (err, result) {
  if (err) throw err;

  console.log('-----> Fetching NPC Stations');
  for (stationID in result.outposts) {
    station = result.outposts[stationID];
    Station.update({stationID: stationID}, {$set: station}, {upsert: true}, function(err) { throw err; });
    count += 1;
    process.stdout.write('.');
  }

  console.log('');
  console.log('       %s Stations Updated', count);
  mongoose.disconnect();
});


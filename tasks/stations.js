var async = require('async')
  , eveapi = require('hamster')
  , mongoose = require('mongoose')
  , root = require('path').normalize(__dirname + '/..')
  , mongooseTypes = require("mongoose-types")
  , useTimestamps = mongooseTypes.useTimestamps

var Station = require(root + '/app/models/station')

// mongoose.set('debug', true)

'use strict';

module.exports = function(grunt) {
  grunt.registerTask('update_outposts', 'Updates outposts from CCP EVEOnline API.', function() {

    mongoose.connect(process.env.MONGO_URL);
    var db = mongoose.connection;
    var callback = this.async();
    var count = 0;

    eveapi.fetch('eve:ConquerableStationList', {}, function (err, result) {
      if (err) throw err;

      grunt.log.write('-----> Fetching NPC Stations\n');
      for (stationID in result.outposts) {
        station = result.outposts[stationID];
        Station.update({stationID: stationID}, {$set: station}, {upsert: true}, function(err) { throw err; });

        count += 1;
        grunt.verbose.write('.');
      }

      grunt.verbose.write("\n")
      grunt.log.write('       %s Stations Updated: ', count);
      mongoose.disconnect();
      grunt.log.ok();
    });

    return true;
  });

};


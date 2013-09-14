var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var Station = Schema({
  stationID: {type: Number, index: true, unique: true},
  stationName: String,
  solarSystemID: Number,
  regionID: Number,
  constellationID: Number,
  corporationID: Number,
  security: Number
});

module.exports = mongoose.model('Station', Station);
var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Station = Schema({
  stationID: {type: Number, index: true, unique: true},
  stationName: {type: String, default: null},
  solarSystemID: {type: Number, index: true},
  solarSystemName: {type: String, default: null}
});

module.exports = mongoose.model('Station', Station);
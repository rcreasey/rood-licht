var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Station = require('./station')

var Route = Schema({
  startStation: {type: Schema.Types.ObjectId, ref: 'Station', required: true},
  endStation: {type: Schema.Types.ObjectId, ref: 'Station', required: true},
  bidirectional: {type: Boolean, default: true, required: true},
  rate: {type: Number, default: 0, required: true}
});

Route.virtual('is_deklein').get(function () {
  if ( this.startStation.solarSystemID >= 30002889 && this.startStation.solarSystemID <= 30002956 ) {
    return true;
  } else if ( this.endStation.solarSystemID >= 30002889 && this.endStation.solarSystemID <= 30002956 ) {
    return true;
  } else {
    return false;
  }
});

module.exports = mongoose.model('Route', Route);
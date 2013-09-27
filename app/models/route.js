var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Station = require('./station')

var Route = Schema({
  startStation: {type: Schema.Types.ObjectId, ref: 'Station', required: true},
  endStation: {type: Schema.Types.ObjectId, ref: 'Station', required: true},
  bidirectional: {type: Boolean, default: true, required: true},
  rate: {type: Number, default: 0, required: true}
});

Route.virtual('startStationName').get(function () {
  return this.startStation === null ? this.startStation : this.startStation.stationName
});

Route.virtual('endStationName').get(function () {
  return this.endStation === null ? this.endStation : this.endStation.stationName
});

Route.virtual('startStationNameShort').get(function () {
  return this.startStation === null ? this.startStation : this.startStation.stationName.split(' ',1)
});

Route.virtual('endStationNameShort').get(function () {
  return this.endStation === null ? this.endStation : this.endStation.stationName.split(' ',1)
});

Route.virtual('is_deklein').get(function () {
  if ( this.startStation === null || this.endStation === null ) {
    return false;
  } else if ( this.startStation.solarSystemID >= 30002889 && this.startStation.solarSystemID <= 30002956 ) {
    return true;
  } else if ( this.endStation.solarSystemID >= 30002889 && this.endStation.solarSystemID <= 30002956 ) {
    return true;
  } else {
    return false;
  }
});

module.exports = mongoose.model('Route', Route);
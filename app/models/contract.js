var mongoose = require('mongoose')
  , Schema = mongoose.Schema;

var Contract = Schema({
  contractID: {type: Number, index: true, unique: true},
  issuerID: Number,
  issuerName: {type: String, default: null},
  issuerCorpID: Number,
  issuerCorpName: {type: String, default: null},
  startStationID: Number,
  startStationName: {type: String, default: null},
  endStationID: Number,
  endStationName: {type: String, default: null},
  type: String,
  status: String,
  title: String,
  forCorp: Boolean,
  dateIssued: Date,
  dateExpired: Date,
  dateAccepted: Date,
  numDays: Number,
  dateCompleted: Date,
  price: Number,
  reward: Number,
  collateral: Number,
  volume: Number
});

var station_id_to_name = function(stationID) {
  switch(stationID) {
    case 60003760:
      return 'Jita 4-4 - CNAP';
    case 61000299:
      return 'MZ1E-P IX';
    case 61000005:
      return 'JU-OWQ VII';
    case 60014945:
      return '1DH-SX III';
    case 61000854:
      return '4-EP12 VIII';
    case 60012334:
      return 'Jan VI - Moon 21';
    case 60014917:
      return 'VFK-IV VI';
    case 61000358:
      return '85-B52 IV';
    case 61000827:
      return 'E-FIC0 I';
    case 61000166:
      return 'S-DN5M IX';
    default:
      return stationID;
  }
};

Contract.methods.startStation = function () {
  return station_id_to_name( this.startStationID );
};

Contract.methods.endStation = function () {
  return station_id_to_name( this.endStationID );
};

module.exports = mongoose.model('Contract', Contract);
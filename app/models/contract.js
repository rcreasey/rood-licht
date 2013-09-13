var mongoose = require('mongoose')
  , Schema = mongoose.Schema

var Contract = Schema({
  contractID: {type: Number, index: true, unique: true},
  issuerID: Number,
  issuerName: {type: String, default: null},
  issuerCorpID: Number,
  issuerCorpName: {type: String, default: null},
  startStationID: Number,
  startStationName: {type: String, default: null},
  startSolarSystemID: Number,
  endStationID: Number,
  endStationName: {type: String, default: null},
  endSolarSystemID: Number,
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

module.exports = mongoose.model('Contract', Contract);
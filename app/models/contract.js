var mongoose = require('mongoose')
  , Schema = mongoose.Schema
  , Station = require('./station')

var Contract = Schema({
  contractID: {type: Number, index: true, unique: true},
  issuerID: Number,
  issuerName: {type: String, default: null},
  issuerCorpID: Number,
  issuerCorpName: {type: String, default: null},
  startStationID: Number,
  endStationID: Number,
  startStation: {type: Schema.Types.ObjectId, ref: 'Station'},
  endStation: {type: Schema.Types.ObjectId, ref: 'Station'},
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
  volume: Number,
  cost: Number,
  delta: Number,
  is_valid: Boolean,
  note: String
});

Contract.virtual('startStationName').get(function () {
  return this.startStation === null ? this.startStation : this.startStation.stationName
});

Contract.virtual('endStationName').get(function () {
  return this.endStation === null ? this.endStation : this.endStation.stationName
});


module.exports = mongoose.model('Contract', Contract);
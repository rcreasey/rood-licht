var mongooseTypes = require("mongoose-types");

module.exports = function() {
  this.mongoose = require('mongoose');
  this.mongoose.connect(this.set('db-uri'));
  mongooseTypes.loadTypes(this.mongoose);
}
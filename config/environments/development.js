var express = require('express');

module.exports = function() {
  this.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
  this.set('db-uri', 'mongodb://localhost/rood-licht-handel-bv');
  this.set('view options', {
    pretty: true
  });
}

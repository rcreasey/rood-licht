var newrelic = require('newrelic')
  , express = require('express')
  , mongoose = require('mongoose')
  , mongo_store = require('connect-mongostore')(express)
  , passport = require('passport')
  , poweredBy = require('connect-powered-by')
  , util = require('util')
  , flash = require('connect-flash')
  , moment = require('moment')

module.exports = function() {
  // Version mismatch check
  if (this.version !== require('locomotive').version) {
    console.warn(util.format('version mismatch between local (%s) and global (%s) Locomotive module', require('locomotive').version, this.version));
  }

  // Application settings.
  var root = require('path').normalize(__dirname + '/../..');
  this.set('views', root + '/app/views');
  this.set('view engine', 'jade');

  // Register the datastore
  this.datastore(require('locomotive-mongoose'));

  // Register the template engine
  this.engine('jade', require('jade').__express);
  this.use(require('less-middleware')({ src: root + '/public', compress: true }));
  this.use(express.static(root + '/public'));

  // Register Globals
  this.locals({
    moment: require('moment'),
    accounting: require('accounting')
  });

  // Template engines
  this.format('html', { extension: '.jade' });

  // Connect modules
  this.use(poweredBy('Locomotive'));
  this.use(express.logger());
  this.use(express.favicon());
  this.use(express.cookieParser());
  this.use(express.json());
  this.use(express.urlencoded());
  this.use(express.methodOverride());

  // Session Store
  this.use(express.session({ secret: 'r00d l1cht', maxAge: moment().add('week', 1)._d, expires: moment().add('week', 1)._d,
                             cookie: { path: '/', httpOnly: true, maxAge: moment().add('week', 1)._d, _expires: moment().add('week', 1)._d},
                             store: new mongo_store(process.env.MONGO_URL) }));
  this.use(passport.initialize());
  this.use(passport.session());
  this.use(flash());
  
  this.use(this.router);
}



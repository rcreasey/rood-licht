var passport = require('passport')  
  , login = require('connect-ensure-login')
  , root = require('../app/controllers/root_controller')
  , contracts = require('../app/controllers/contracts_controller')
  , statistics = require('../app/controllers/statistics_controller')
  , users = require('../app/controllers/users_controller')
  , shipping_routes = require('../app/controllers/routes_controller')

module.exports = function routes() {
  this.get('routes/?', login.ensureLoggedIn('/login'), shipping_routes.index);
  this.get('routes/new/?', login.ensureLoggedIn('/login'), shipping_routes.new);
  this.post('routes', login.ensureLoggedIn('/login'), shipping_routes.create);
  this.del('routes/:id', login.ensureLoggedIn('/login'), shipping_routes.destroy);

  this.get('contracts/?:filter?', login.ensureLoggedIn('/login'), contracts.index);

  this.get('statistics/?', login.ensureLoggedIn('/login'), statistics.index);
  this.get('statistics/volume/?:duration?', login.ensureLoggedIn('/login'), statistics.volume);
  this.get('statistics/reward/?:duration?', login.ensureLoggedIn('/login'), statistics.reward);
  this.get('statistics/tips/?:duration?', login.ensureLoggedIn('/login'), statistics.tips);
  this.get('statistics/failed/?:duration?', login.ensureLoggedIn('/login'), statistics.failed);
  this.get('statistics/rejected/?:duration?', login.ensureLoggedIn('/login'), statistics.rejected);

  this.get('users/?', login.ensureLoggedIn('/login'), users.index);
  this.del('users/:id', login.ensureLoggedIn('/login'), users.destroy);

  this.get('login', users.login);
  this.post('login', passport.authenticate('local', { successReturnToOrRedirect: '/',
                                                      failureRedirect: '/login',
                                                      failureFlash: true }));
  this.get('register', login.ensureLoggedOut('/logout'), users.new);
  this.post('register', login.ensureLoggedOut('/logout'), users.create);
  this.get('logout', users.logout);

  this.root(root.index);
};
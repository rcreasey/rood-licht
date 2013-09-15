var passport = require('passport')  
  , login = require('connect-ensure-login')
  , root = require('../app/controllers/root_controller')
  , contracts = require('../app/controllers/contracts_controller')
  , statistics = require('../app/controllers/statistics_controller')
  , users = require('../app/controllers/users_controller')

module.exports = function routes() {
  this.get('contracts/?:filter?', login.ensureLoggedIn('/login'), contracts.index);
  this.get('statistics/?', login.ensureLoggedIn('/login'), statistics.index);
  this.get('statistics/volume/?:duration?', statistics.volume);

  this.get('login', users.login);
  this.post('login', passport.authenticate('local', { successReturnToOrRedirect: '/',
                                                      failureRedirect: '/login',
                                                      failureFlash: true }));
  this.get('register', login.ensureLoggedOut('/logout'), users.new);
  this.post('register', login.ensureLoggedOut('/logout'), users.create);
  this.get('logout', users.logout);

  this.root(root.index);
};
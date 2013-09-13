var passport = require('passport')  
  , login = require('connect-ensure-login')
  , contracts = require('../app/controllers/contracts_controller')
  , statistics = require('../app/controllers/statistics_controller')

module.exports = function routes() {

  this.get('contracts', login.ensureLoggedIn('/login'), contracts.index);
  this.get('statistics', login.ensureLoggedIn('/login'), statistics.index);

  this.get('login', 'users#login')
  this.post('login', passport.authenticate('local', { successReturnToOrRedirect: '/',
                                                      failureRedirect: '/login',
                                                      failureFlash: true }));
  this.get('register', 'users#new');
  this.post('register', 'users#create');
  this.get('logout', 'users#logout');

  this.root('root#index');
};
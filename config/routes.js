var passport = require('passport')  
  , login = require('connect-ensure-login')

module.exports = function routes() {

  this.get('contracts', login.ensureLoggedIn('/login'), { controller: 'contracts', action: 'index' });
  this.get('statistics', login.ensureLoggedIn('/login'), { controller: 'statistics', action: 'index' });

  this.get('login', 'users#login')
  this.post('login', passport.authenticate('local', { successReturnToOrRedirect: '/',
                                                      failureRedirect: '/login',
                                                      failureFlash: true }));
  this.get('register', 'users#new');
  this.post('register', 'users#create');
  this.get('logout', 'users#logout');

  this.root('root#index');
};
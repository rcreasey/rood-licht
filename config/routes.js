var passport = require('passport')  
  , login = require('connect-ensure-login')

module.exports = function routes() {
  this.root('root#index');

  this.match('contracts', login.ensureLoggedIn('/login'), { controller: 'contracts', action: 'index' });
  this.match('statistics', login.ensureLoggedIn('/login'), { controller: 'statistics', action: 'index' });

  this.match('login', passport.authenticate('local', { successReturnToOrRedirect: '/',
                                                      failureRedirect: '/login',
                                                      failureFlash: true }), {via: 'post'});
  this.match('login', { controller: 'users', action: 'login' });
  this.match('register', login.ensureLoggedOut('/'), { controller: 'users', action: 'new' });
  this.match('register', login.ensureLoggedOut('/'), { controller: 'users', action: 'create' });
  this.match('logout', { controller: 'users', action: 'logout' });

};
var passport = require('passport');

module.exports = function routes() {
  this.root('root#index');

  this.match('contracts', { controller: 'contracts', action: 'index' });
  this.match('statistics', { controller: 'statistics', action: 'index' });

  this.resource('users');
  this.match('login', 'users#login', { via: 'get' });
  this.match('login', passport.authenticate('local', { successRedirect: '/', failureRedirect: '/login', failureFlash: true }), 
                                                     { via: 'post' });
  this.match('logout', { controller: 'users', action: 'logout' });
}
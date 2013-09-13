var locomotive = require('locomotive')
  , passport = require('passport')
  , Controller = locomotive.Controller
  , UsersController = new Controller()
  , User = require('../models/user')

UsersController.login = function() {
  this.title = "Login";
  this.message = this.req.flash('error');
  this.render();
};

UsersController.new = function() {
  this.title = "Register";
  this.user = new User();
  
  this.render('register');
};

UsersController.create = function() {
  var self = this;
  User.register(new User({ username : this.req.body.username }), this.req.body.password, function(err, user) {
    if (err)
      return self.render('register', { title: 'Register', user : user });

    self.redirect('/');
  });
};

UsersController.logout = function() {
  this.req.logout();
  return this.redirect('/');
};

module.exports = UsersController;
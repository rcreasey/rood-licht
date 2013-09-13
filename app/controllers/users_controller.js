var locomotive = require('locomotive');
var passport = require('passport');
var Controller = locomotive.Controller;

var User = require('../models/user');

var UsersController = new Controller();

UsersController.new = function() {
  this.title = "Register";
  this.render();
};

UsersController.create = function() {
  var user = new User();

  user.email = this.param('email');
  user.password = this.param('password');

  var self = this;
  user.save(function (err) {
    if (err)
      throw err
      return self.redirect(self.urlFor({ action: 'new' }));

    return self.redirect(self.urlFor({ action: 'login' }));
  });
};

UsersController.login = function() {
  this.title = "Login";
  this.message = this.req.flash('error');
  this.render();
};

module.exports = UsersController;
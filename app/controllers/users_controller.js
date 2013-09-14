var locomotive = require('locomotive')
  , passport = require('passport')
  , Controller = locomotive.Controller
  , UsersController = new Controller()
  , User = require('../models/user')

UsersController.login = function(req, res) {
  res.render('users/login', { title: 'Login', user: req.user, messages: req.flash('error') });
};

UsersController.new = function(req, res) {
  res.render('users/register', { title: 'Register', user: req.user, messages: req.flash('error') });
};

UsersController.create = function(req, res) {  
  User.register(new User({ username : req.body.username }), req.body.password, function(err, user) {
    if (err)
      return res.render('register', { title: 'Register', user: req.user, messages: err });

    res.redirect('/');
  });
};

UsersController.logout = function(req, res) {  
  req.logout();
  return res.redirect('/');
};

module.exports = UsersController;
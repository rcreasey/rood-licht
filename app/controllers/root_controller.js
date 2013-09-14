var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , RootController = new Controller()

RootController.index = function(req, res) {
  res.render('root/index', {title: 'Pricing', user: req.user});
};

module.exports = RootController;
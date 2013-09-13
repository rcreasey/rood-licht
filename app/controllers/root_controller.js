var locomotive = require('locomotive')
  , Controller = locomotive.Controller
  , RootController = new Controller()

RootController.index = function() {
  this.title = 'Pricing';
  this.render();
};

module.exports = RootController;
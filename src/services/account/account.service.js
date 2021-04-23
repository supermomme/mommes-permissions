// Initializes the `account` service on path `/account`
const { Account } = require('./account.class');
const createModel = require('../../models/account.model');
const hooks = require('./account.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/account', new Account(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('account');

  service.hooks(hooks);
};

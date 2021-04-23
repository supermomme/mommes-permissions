// Initializes the `login` service on path `/login`
const { Login } = require('./login.class');
const createModel = require('../../models/login.model');
const hooks = require('./login.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    whitelist: [ '$contains' ]
  };

  // Initialize our service with any options it requires
  app.use('/login', new Login(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('login');

  service.hooks(hooks);
};

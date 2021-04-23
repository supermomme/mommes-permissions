// Initializes the `some-example-service` service on path `/some-example-service`
const { SomeExampleService } = require('./some-example-service.class');
const createModel = require('../../models/some-example-service.model');
const hooks = require('./some-example-service.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/some-example-service', new SomeExampleService(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('some-example-service');

  service.hooks(hooks);
};

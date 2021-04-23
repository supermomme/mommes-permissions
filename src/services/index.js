const login = require('./login/login.service.js');
const account = require('./account/account.service.js');
const session = require('./session/session.service.js');
const role = require('./role/role.service.js');
const scenario = require('./scenario/scenario.service.js');
const someExampleService = require('./some-example-service/some-example-service.service.js');
// eslint-disable-next-line no-unused-vars
module.exports = function (app) {
  app.configure(login);
  app.configure(account);
  app.configure(session);
  app.configure(role);
  app.configure(scenario);
  app.configure(someExampleService);
};

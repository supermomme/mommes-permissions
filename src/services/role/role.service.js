// Initializes the `role` service on path `/role`
const { Role } = require('./role.class');
const createModel = require('../../models/role.model');
const hooks = require('./role.hooks');
const systemRoles = require('../../permissions/systemRoles');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/role', new Role(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('role');

  service.hooks(hooks);

  (async function () {
    for (let role of systemRoles) await upsert(role);
  })().catch(console.error);

  async function upsert(role) {
    const existingRole = (await service.find({query: {_id: role._id, $limit: 0}})).total > 0;
    if (existingRole) {
      await service.update(role._id, role);
    } else {
      await service.create(role);
    }
  }
};

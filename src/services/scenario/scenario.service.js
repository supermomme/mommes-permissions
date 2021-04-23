// Initializes the `scenario` service on path `/scenario`
const { Scenario } = require('./scenario.class');
const hooks = require('./scenario.hooks');
const scenarios = require('../../permissions/scenarios');

module.exports = function (app) {
  const options = {
    id: '_id',
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/scenario', new Scenario(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('scenario');

  service.hooks(hooks);

  (async function createScenarios() {
    for (const scenario of scenarios) {
      const _id = scenario._id;
      const permissions = scenario.permissions.map(perString => {
        if (typeof perString === 'object') return perString;
        const splitted = perString.split(':');
        const service = splitted[0];
        const action = splitted[1];
        const idGroup = action === 'create' ? null : splitted[2];
        const fields = action === 'create' ? splitted.slice(2) : splitted.slice(3);
        return {
          service,
          action,
          idGroup,
          fields
        };
      });
      await service.create({
        _id,
        permissions
      });
    }
  })().catch(console.error);
  
};

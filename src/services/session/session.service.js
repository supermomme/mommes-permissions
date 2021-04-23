// Initializes the `session` service on path `/session`
const { Session } = require('./session.class');
const createModel = require('../../models/session.model');
const hooks = require('./session.hooks');

module.exports = function (app) {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  };

  // Initialize our service with any options it requires
  app.use('/session', new Session(options, app));

  // Get our initialized service so that we can register hooks
  const service = app.service('session');

  service.hooks(hooks);

  if (app.get('autoSessionSuppress')) suppressAllSessions().catch(console.error);
  async function suppressAllSessions() {
    const sessionIds = (await service.find({
      paginate: false,
      query: {
        $or: [
          { suppressed: undefined },
          { suppressed: false }
        ],
        $select: ['_id']
      }
    })).map(s => s._id);
    await Promise.all(sessionIds.map(id => service.patch(id, { suppressed: true })));
  }
};

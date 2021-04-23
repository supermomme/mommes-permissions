const { Forbidden } = require('@feathersjs/errors');

module.exports = (options = { publicRoutes: ['authentication'] }) => {
  return async context => {
    if (context.params.authentication) {
      context.params.authentication.payload = await context.app.service('authentication').verifyAccessToken(context.params.authentication.accessToken);
      if (context.params.authentication.payload.session) {
        context.params.session = context.params.authentication.payload.session;
        const { suppressed } = await context.app.service('session').get(context.params.session._id, {$select:['suppressed']}).catch(() => Promise.resolve({suppressed: true}));
        if (suppressed) throw new Forbidden('Session is suppressed');
      } else {
        if (!options.publicRoutes.includes(context.path)) throw new Forbidden('Invalid JWT. Use a the jwt token from the account-login');
      }
    }
  };
};
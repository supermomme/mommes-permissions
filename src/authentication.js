const { AuthenticationService, JWTStrategy, AuthenticationBaseStrategy } = require('@feathersjs/authentication');
const { LocalStrategy } = require('@feathersjs/authentication-local');
const { expressOauth } = require('@feathersjs/authentication-oauth');
const { NotAuthenticated, BadRequest, GeneralError } = require('@feathersjs/errors');

class CustomLocalStrategy extends LocalStrategy {
  async getEntity(entity, params) {
    delete params.provider;
    return await super.getEntity(entity, params);
  }

  async authenticate (...args) {
    const { login } = await super.authenticate(...args);
    const accounts = await this.app.service('account').find({
      paginate: false,
      query: {
        _id: { $in: login.accountIds },
        $select: [ '_id', 'firstname', 'lastname' ]
      }
    });
    return { accounts, login };
  }
}

class AccountStrategy extends AuthenticationBaseStrategy {
  async authenticate(authentication, params) {
    if (!params.authentication || !params.authentication.accessToken) throw new NotAuthenticated('Missing JWT');
    const jwtPayload = await this.authentication.verifyAccessToken(params.authentication.accessToken);
    if (!jwtPayload.accounts || !jwtPayload.login) throw new NotAuthenticated('Invalid JWT. Use a the jwt token from the login');
    if (!jwtPayload.accounts.map(acc => acc._id).includes(authentication.accountId)) throw BadRequest('AccountId not allowed', { accountId: authentication.accountId });

    const account = await this.app.service('account').get(authentication.accountId)
      .catch(() => { throw new BadRequest('Invalid accountId', { accountId: authentication.accountId }); });
    const role = await this.app.service('role').get(account.roleId || 'ANONYMOUS')
      .catch(() => { throw new BadRequest('Invalid roleId', { account, roleId: account.roleId || 'ANONYMOUS' }); });
    const scenarios = await this.app.service('scenario').find({
      paginate: false,
      query: {
        _id: { $in: role.scenarioIds }
      }
    })
      .catch(() => { throw new BadRequest('Invalid roleId', { account, roleId: account.roleId || 'ANONYMOUS' }); });

    const permissions = [
      ...scenarios.reduce((prev, cur) => { prev.push(...cur.permissions); return prev; }, [])
    ];

    const session = await this.app.service('session').create({
      accountId: account._id,
      loginId: jwtPayload.login._id,
      scenarioIds: role.scenarioIds,
      permissions
    }).catch((error) => { throw new GeneralError('Error at session created', { error }); });

    return { session };
  }
}

class MyAuthService extends AuthenticationService {
  async getTokenOptions(authResult, params) {
    const options = await super.getTokenOptions(authResult, params);
    if (authResult.accounts) options.expiresIn = '5m';
    return options;
  }

  async getPayload(authResult, params) {
    const payload = await super.getPayload(authResult, params);
    if (authResult.accounts) payload.accounts = authResult.accounts;
    if (authResult.session) payload.session = authResult.session;
    if (authResult.login) payload.login = authResult.login;
    return payload;
  }
}

module.exports = app => {
  const authentication = new MyAuthService(app);

  authentication.register('jwt', new JWTStrategy());
  authentication.register('account', new AccountStrategy()); // choose an account
  authentication.register('local', new CustomLocalStrategy());

  app.use('/authentication', authentication);
  app.configure(expressOauth());
};

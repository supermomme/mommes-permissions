const authenticate = require('./hooks/authenticate');
const authenticationGuard = require('./hooks/authentication-guard');
// Application hooks that run for every service

module.exports = {
  before: {
    all: [authenticate(), authenticationGuard()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  after: {
    all: [authenticationGuard()],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
};

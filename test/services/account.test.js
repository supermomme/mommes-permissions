const assert = require('assert');
const app = require('../../src/app');

describe('\'account\' service', () => {
  it('registered the service', () => {
    const service = app.service('account');

    assert.ok(service, 'Registered the service');
  });
});

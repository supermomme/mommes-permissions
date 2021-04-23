const assert = require('assert');
const app = require('../../src/app');

describe('\'scenario\' service', () => {
  it('registered the service', () => {
    const service = app.service('scenario');

    assert.ok(service, 'Registered the service');
  });
});

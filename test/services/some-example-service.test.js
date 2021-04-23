const assert = require('assert');
const app = require('../../src/app');

describe('\'some-example-service\' service', () => {
  it('registered the service', () => {
    const service = app.service('some-example-service');

    assert.ok(service, 'Registered the service');
  });
});

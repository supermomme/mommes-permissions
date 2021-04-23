/* String type

normal:               service:action:idGroup:field1:field2:field3.nested.with.dots
exception in created: service:action:field1:field2:field3.nested.withdots


*/
module.exports = [
  {
    _id: 'manageSelf',
    permissions: [
      'login:read:own:username:accountIds',
      'login:patch:own:password',
      'role:read:all:name:baseRoleId',

      'some-example-service:read:all:text',
      'some-example-service:read:all:createdAt',
      'some-example-service:read:6082eaa79f782f03b45054e1:text2',
      'some-example-service:create:text:text2',
      'some-example-service:patch:6082eaa79f782f03b45054e1:text2',
    ]
  },
  {
    _id: 'adminScenario',
    permissions: [
      'login:read:all:*',
      'login:patch:all:*',
      'login:create:*',
      'login:remove:all:*',
      'scenario:read:all:*',
      'scenario:patch:all:*',
      'scenario:create:*',
      'scenario:remove:all:*',
      'session:read:all:*',
      'session:patch:all:*',
      'session:create:*',
      'session:remove:all:*',
      'role:read:all:*',
      'role:patch:all:*',
      'role:create:*',
      'role:remove:all:*',
      'account:read:all:*',
      'account:patch:all:*',
      'account:create:*',
      'account:remove:all:*',
    ]
  }
];
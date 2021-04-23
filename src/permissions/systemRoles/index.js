/* String type

normal:               service:action:idGroup:field1:field2:field3.nested.with.dots
exception in created: service:action:field1:field2:field3.nested.withdots


*/
module.exports = [
  {
    _id: 'ANONYMOUS',
    name: 'Anonym',
    baseRoleId: null,
    scenarioIds: [
      'manageSelf'
    ],
  },
  {
    _id: 'ADMIN',
    name: 'System-Administrator',
    baseRoleId: 'ANONYMOUS',
    scenarioIds: [
      'manageSelf',
      // 'adminScenario'
    ],
  }
];
function canReadService(session, service) {
  return session.permissions.some(perm => perm.action === 'read' && perm.service.toString() == service.toString());
}

function canCreateService(session, service) {
  return session.permissions.some(perm => perm.action === 'create' && perm.service.toString() == service.toString());
}

function canPatchService(session, service) {
  return session.permissions.some(perm => perm.action === 'patch' && perm.service.toString() == service.toString());
}

function canRemoveService(session, service) {
  return session.permissions.some(perm => perm.action === 'remove' && perm.service.toString() == service.toString());
}

function hasScenario(session, scenarioId = '') {
  return session.scenarioIds.some(id => id.toString == scenarioId.toString());
}

module.exports = {
  canReadService,
  canCreateService,
  canPatchService,
  canRemoveService,
  hasScenario
};
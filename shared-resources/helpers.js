function hasScenario(session, scenarioId = '') {
  return session.scenarioIds.some(id => id.toString == scenarioId.toString());
}

module.exports = {
  hasScenario
};
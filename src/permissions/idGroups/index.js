module.exports.getAvailableIds = async (idGroup, context) => {
  switch (idGroup) {
  case 'own': {
    if (context.path === 'account') return [context.params.session.accountId.toString()];
    if (context.path === 'login') return [context.params.session.loginId.toString()];
    return [];
  }
  case 'all': {
    return (await context.service.find({
      paginate: false,
      query: { $select: ['_id'] }
    })).map(entity => entity._id.toString());
  }
  
  default:
    return idGroup.split(':');
  }
};
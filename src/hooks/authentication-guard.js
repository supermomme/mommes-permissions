// Use this hook to manipulate incoming or outgoing data.
// For more information on hooks see: http://docs.feathersjs.com/api/hooks.html

const { Forbidden, GeneralError } = require('@feathersjs/errors');
const { getAvailableIds } = require('../permissions/idGroups');
const _ = require('lodash');
const unflatten = require('unflatten');

// eslint-disable-next-line no-unused-vars
module.exports = (options = {}) => {
  return async context => {
    if (!context.params.session) {
      if (!context.provider) return;
      else return new GeneralError();
    }

    var permissions = [];
    if (context.params.session) {
      permissions.push(...context.params.session.permissions);
    } else {
      const anonymousRole = await context.app.service('role').get('ANONYMOUS').catch(console.error);
      const scenarios = await context.app.service('scenario').find({
        paginate: false,
        query: {
          _id: { $in: anonymousRole.scenarioIds }
        }
      });
      permissions.push(...scenarios.reduce((prev, cur) => { prev.push(...cur.permissions); return prev; }, []));
    }
    permissions = permissions.filter(p => p.service === context.path);
    if (context.type === 'before') {
      switch (context.method) {
      case 'find':
      case 'get': {
        const readPermissions = permissions.filter(perm => perm.action === 'read');
        if (readPermissions.length === 0) throw new Forbidden();
        /// merge availableIds to query._id.$in
        const availableIds = (await Promise.all(readPermissions.map(perm => getAvailableIds(perm.idGroup, context)))).flat();
        if (context.id != undefined && !availableIds.includes(context.id.toString())) throw new Forbidden();
        if (typeof context.params.query._id !== 'object' && context.params.query._id != undefined && !availableIds.includes(context.params.query._id))
          throw new Forbidden();
        if (typeof context.params.query._id === 'object' && context.params.query._id != undefined && !context.params.query._id.$in)
          context.params.query._id.$in = availableIds;
        if (typeof context.params.query._id === 'object' && context.params.query._id != undefined && !!context.params.query._id.$in) {
          if (!Array.isArray(context.params.query._id.$in)) context.params.query._id.$in = [context.params.query._id.$in];
          context.params.query._id.$in = context.params.query._id.$in.filter(id => availableIds.includes(id));
        }
        if (!context.params.query._id) context.params.query._id = { $in: availableIds };

        /// merge fields to $select
        const availableFields = readPermissions.flatMap(perm => perm.fields);
        if (!context.params.query.$select) context.params.query.$select = availableFields;
        else context.params.query.$select = context.params.query.$select.filter(f => availableFields.includes(f));

        // console.log(context.params.query);

        return;
      }
      case 'create': {
        const createPermission = permissions.filter(perm => perm.action === 'create');
        if (createPermission.length === 0) throw new Forbidden();

        // filter data by fields
        const fields = createPermission.flatMap(perm => perm.fields);
        const filterdData = {};
        for (const field of fields) {
          const data = _.get(context.data, field);
          if (data != undefined) filterdData[field] = data;
        }
        context.data = unflatten(filterdData);

        return;
      }
      case 'patch': {
        const patchPermission = permissions.filter(perm => perm.action === 'patch');
        if (patchPermission.length === 0) throw new Forbidden();
        const availableIds = (await Promise.all(patchPermission.map(perm => getAvailableIds(perm.idGroup, context)))).flat();
        if (!availableIds.includes(context.id)) throw new Forbidden();

        const fields = patchPermission.flatMap(perm => perm.fields);
        const filterdData = {};
        for (const field of fields) {
          const newData = _.get(context.data, field);
          if (newData != undefined) filterdData[field] = newData;
        }
        context.data = unflatten(filterdData);
        return;
      }
      case 'remove': {
        const removePermission = permissions.filter(perm => perm.action === 'remove');
        if (removePermission.length === 0) throw new Forbidden();
        const availableIds = (await Promise.all(removePermission.map(perm => getAvailableIds(perm.idGroup, context)))).flat();
        if (!availableIds.includes(context.id)) throw new Forbidden();
        return;
      }
      
      default:
        throw new Forbidden();
      }

    }
    ///////////////
    if (context.type === 'after') {
      switch (context.method) {
      case 'find': {
        context.result.data = await Promise.all(context.result.data.map(async data => filterResult(data, permissions, context)));
        return;
      }
      case 'create':
      case 'patch':
      case 'remove':
      case 'get': {
        context.result = await filterResult(context.result, permissions, context);
      }
      }
    }
  };
};

async function filterResult(data, permissions, context) {
  const readPermissions = permissions.filter(perm => perm.action === 'read');
  const availableFields = [
    // default
    '_id',
    // read fields
    ...(await Promise.all(readPermissions.map(async perm => {
      const ids = (await getAvailableIds(perm.idGroup, context)).map(d=>d.toString());
      if (!ids.includes(data._id.toString())) return [];
      return perm.fields;
    }))).flat(),
    // method field (create, patch, remove)
    ...((context.method != 'get' && context.method != 'find') ? (await Promise.all(permissions.filter(perm => perm.action === context.method).map(async perm => {
      if (context.method != 'create') {
        const ids = (await getAvailableIds(perm.idGroup, context)).map(d=>d.toString());
        if (!ids.includes(data._id.toString())) return [];
      }
      return perm.fields;
    }))).flat() : [])
  ];

  const filterdData = {};
  for (const field of availableFields) {
    const fData = _.get(data, field);
    if (fData != undefined) filterdData[field] = fData;
  }
  return unflatten(filterdData);
}

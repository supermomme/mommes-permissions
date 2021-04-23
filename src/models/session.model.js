// session-model.js - A mongoose model
// 
// See http://mongoosejs.com/docs/models.html
// for more of what you can do here.
module.exports = function (app) {
  const modelName = 'session';
  const mongooseClient = app.get('mongooseClient');
  const { Schema } = mongooseClient;
  const schema = new Schema({
    suppressed: { type: Boolean, default: false },
    accountId: { type: mongooseClient.Schema.Types.ObjectId, required: true },
    loginId: { type: mongooseClient.Schema.Types.ObjectId, required: true },
    scenarioIds: [{ type: String }],
    permissions: [{
      service: { type: String },
      action: { type: String },
      idGroup: { type: String },
      fields: [{ type: String }],
    }],
    jwtExpiresAt: { type: Date },
  }, {
    minimize: false,
    timestamps: true
  });

  // This is necessary to avoid model compilation errors in watch mode
  // see https://mongoosejs.com/docs/api/connection.html#connection_Connection-deleteModel
  if (mongooseClient.modelNames().includes(modelName)) {
    mongooseClient.deleteModel(modelName);
  }
  return mongooseClient.model(modelName, schema);
  
};

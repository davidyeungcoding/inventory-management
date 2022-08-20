const mongoose = require('mongoose');

// ==================
// || Store Schema ||
// ==================

const storeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  street: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zip: {
    type: String,
    required: true
  },
  users: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'User',
    default: []
  },
  items: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Item',
    default: []
  },
  ingredients: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'ingredient',
    default: []
  }
});

module.exports.storeModel = mongoose.model('Store', storeSchema);

// ==================
// || Create Store ||
// ==================

module.exports.createStore = (store, callback) => {
  store.save(callback);
};

// ================
// || Edit Store ||
// ================

module.exports.editStoreDetails = (id, payload, callback) => {
  this.storeModel.findByIdAndUpdate(id, { $set: payload }, { new: true }, callback);
};

// ==================
// || Search Store ||
// ==================

// ==================
// || Delete Store ||
// ==================

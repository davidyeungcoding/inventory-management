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
    ref: 'Ingredient',
    default: []
  },
  orders: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Order',
    default: []
  }
});

module.exports.storeModel = mongoose.model('Store', storeSchema);

// ======================
// || Shared Variables ||
// ======================

const importOrders = {
  from: 'orders',
  localField: 'orders',
  foreignField: '_id',
  as: 'orders'
};

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

module.exports.editStoreUserList = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const modifier = action === '$push' ? '$each' : '$in';
  const update = { [action]: { users: { [modifier]: payload.userList } } };
  this.storeModel.findByIdAndUpdate(payload._id, update, { new: true }, callback)
  .populate('users', 'username accountType');
};

module.exports.editUserListFromUser = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const query = { $in: payload.storeList };
  const update = { [action]: { users: payload._id } };
  this.storeModel.updateMany({ _id: query}, update, callback);
};

module.exports.editItemFromItem = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const update = { [action]: { items: payload.itemId } };
  this.storeModel.findByIdAndUpdate(payload.storeId, update, callback);
};

module.exports.editIngredientFromIngredient = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const update = { [action]: { ingredients: payload.ingredientId } };
  this.storeModel.findByIdAndUpdate(payload.storeId, update, callback);
};

// ==================
// || Search Store ||
// ==================

module.exports.searchStores = (term, id, callback) => {
  const query = term.toString().length ? { name: term, users: id } : { users: id };
  this.storeModel.find(query, callback);
};

module.exports.adminSearchStores = (term, callback) => {
  const query = term.toString().length ? { name: term } : {};
  this.storeModel.find(query, callback);
};

module.exports.retrieveStoreDetails = (storeId, callback) => {
  this.storeModel.findById(storeId, { users: 0, items: 0, ingredients: 0, orders: 0 }, callback);
};

// ==================
// || Delete Store ||
// ==================

module.exports.deleteStore = (id, callback) => {
  this.storeModel.deleteOne({ _id: id }, callback);
};

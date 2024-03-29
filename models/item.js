const mongoose = require('mongoose');

// =================
// || Item Schema ||
// =================

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  price: {
    type: String,
    default: '000'
  },
  active: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: false
  },
  ingredients: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Ingredient',
    default: []
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  }
});

module.exports.itemModel = mongoose.model('Item', itemSchema);

// =================
// || Create Item ||
// =================

module.exports.createItem = (item, callback) => {
  item.save(callback);
};

// ===============
// || Edit Item ||
// ===============

module.exports.editItemDetails = (payload, callback) => {
  const options = { new: true };
  const update = { $set: payload.update };
  this.itemModel.findByIdAndUpdate(payload.id, update, options, callback)
  .populate('ingredients', 'name');
};

module.exports.editIngredients = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const modifier = action === '$push' ? '$each' : '$in';
  const update = { [action]: { ingredients: { [modifier]: payload.ingredients } } };
  const options = { new: true };
  this.itemModel.findByIdAndUpdate(payload.itemId, update, options, callback)
  .populate('ingredients', 'name');
};

module.exports.purgeIngredientFromIngredient = (payload, callback) => {
  const query = { $in: payload.target };
  const update = { $pull: { ingredients: payload.ingredientId } };
  this.itemModel.updateMany({ _id: query }, update, callback);
};

// =================
// || Search Item ||
// =================

module.exports.searchItem = (term, storeId, callback) => {
  const query = term.toString().length ? { name: term, store: storeId } : { store: storeId };
  this.itemModel.find(query, callback)
  .populate('ingredients', 'name');
};

module.exports.searchActiveItems = (storeId, callback) => {
  const query = { store: storeId, active: true };
  this.itemModel.find(query, callback)
  .populate('ingredients', 'name');
};

// =================
// || Delete Item ||
// =================

module.exports.deleteItem = (id, callback) => {
  this.itemModel.findByIdAndRemove({ _id: id }, callback);
};

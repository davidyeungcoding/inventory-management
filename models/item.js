const mongoose = require('mongoose');

// =======================
// || Projection Schema ||
// =======================

// const itemIngredient = new mongoose.Schema({
//   ingredient: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Ingredient'
//   }
// }, { _id: false });

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
  ingredients: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Ingredient',
    default: []
  },
  active: {
    type: Boolean,
    default: false
  },
  available: {
    type: Boolean,
    default: false
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
  this.itemModel.findByIdAndUpdate(payload.id, update, options, callback);
};

module.exports.editIngredients = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const modifier = action === '$push' ? '$each' : '$in';
  const update = { [action]: { ingredients: { [modifier]: payload.ingredients } } };
  const options = { new: true };
  this.itemModel.findByIdAndUpdate(payload.id, update, options, callback);
};

module.exports.purgeIngredient = (payload, callback) => {
  const query = { $in: payload.target };
  const update = { $pull: { ingredients: payload.id } };
  this.itemModel.updateMany({ _id: query }, update, callback);
};

// =================
// || Search Item ||
// =================

module.exports.searchItem = (term, type, callback) => {
  const query = term.toString().length ? { [type]: term } : {};
  
  this.itemModel.find(query, callback)
  .sort({ name: 1 })
  .populate('ingredients', 'name');
};

// =================
// || Delete Item ||
// =================

module.exports.deleteItem = (id, callback) => {
  this.itemModel.deleteOne({ _id: id }, callback);
};

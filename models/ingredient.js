const mongoose = require('mongoose');

// =======================
// || Ingredient Schema ||
// =======================

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  foundIn: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Item',
    default: []
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  }
});

module.exports.ingredientModel = mongoose.model('Ingredient', ingredientSchema);

// =======================
// || Create Ingredient ||
// =======================

module.exports.createIngredient = (ingredient, callback) => {
  ingredient.save(callback);
};

// =====================
// || Edit Ingredient ||
// =====================

module.exports.editIngredient = (payload, callback) => {
  const options = { new: true };
  const update = { $set: payload.update };
  this.ingredientModel.findByIdAndUpdate(payload._id, update, options, callback);
};

module.exports.updateFoundInFromItem = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const query = { $in: payload.ingredients };
  const update = { [action]: { foundIn: payload.itemId } };
  this.ingredientModel.updateMany({ _id: query }, update, callback);
};

// =======================
// || Search Ingredient ||
// =======================

module.exports.searchIngredient = (payload, callback) => {
  const query = payload.term.toString().length ? { name: payload.term, store: payload.storeId }
  : { store: payload.storeId };
  this.ingredientModel.find(query, callback);
};

// =======================
// || Delete Ingredient ||
// =======================

module.exports.deleteIngredient = (id, callback) => {
  this.ingredientModel.deleteOne({ _id: id }, callback);
};

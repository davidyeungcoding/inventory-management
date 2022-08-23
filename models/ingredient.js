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
  this.ingredientModel.findByIdAndUpdate(payload.id, update, options, callback);
};

module.exports.purgeItem = (payload, callback) => {
  const query = { $in: payload.ingredients };
  const update = { $pull: { foundIn: payload.item } };
  this.ingredientModel.updateMany({ _id: query }, update, callback);
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
  const query = payload.term.toString().length ? { [payload.type]: payload.term } : {};
  this.ingredientModel.find(query, callback)
  .sort({ name: 1 });
};

module.exports.searchForDeletion = (id, callback) => {
  this.ingredientModel.findById(id, 'foundIn -_id', callback);
};

// =======================
// || Delete Ingredient ||
// =======================

module.exports.deleteIngredient = (id, callback) => {
  this.ingredientModel.deleteOne({ _id: id }, callback);
};

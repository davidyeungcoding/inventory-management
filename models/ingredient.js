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
    type: Object,
    default: {}
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

module.exports.editIngredient = (id, payload, callback) => {
  const options = { new: true };
  const update = { $set: payload };
  this.ingredientModel.findByIdAndUpdate(id, update, options, callback);
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

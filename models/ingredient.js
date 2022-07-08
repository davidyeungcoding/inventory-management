const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  }
})

module.exports.ingredientSchema = ingredientSchema;
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

module.exports.editIngredient = (id, update, callback) => {
  const options = { new: true };
  this.ingredientModel.findByIdAndUpdate(id, update, options, callback);
};

// =======================
// || Search Ingredient ||
// =======================

module.exports.searchIngredient = (payload, callback) => {
  const query = { [payload.type]: payload.term };

  payload.term.toString().length ? this.ingredientModel.find(query, 'name', callback)
  : this.ingredientModel.find({}, 'name', callback);
};

// =======================
// || Delete Ingredient ||
// =======================

module.exports.deleteIngredient = (id, callback) => {
  this.ingredientModel.deleteOne({ _id: id }, callback);
};

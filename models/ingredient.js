const mongoose = require('mongoose');

// =======================
// || Projection Schema ||
// =======================

const foundIn = new mongoose.Schema({
  item: {
    type: mongoose.Types.ObjectId,
    ref: 'Items'
  }
}, { _id: false });

// =======================
// || Ingredient Schema ||
// =======================

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  foundIn: {
    type: [foundIn],
    default: []
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

module.exports.editIngredient = (id, update, callback) => {
  const options = { new: true };
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

// =======================
// || Delete Ingredient ||
// =======================

module.exports.deleteIngredient = (id, callback) => {
  this.ingredientModel.deleteOne({ _id: id }, callback);
};

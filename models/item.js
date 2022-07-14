const mongoose = require('mongoose');

// =======================
// || Projection Schema ||
// =======================

const itemIngredient = new mongoose.Schema({
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  }
}, { _id: false });

// =================
// || Item Schema ||
// =================

const itemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  ingredients: {
    type: [itemIngredient],
    default: []
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

module.exports.editItem = (payload, callback) => {
  const options = { new: true };
  const update = {
    $set: {
      name: payload.name,
      ingredients: payload.ingredients
    }
  };

  this.itemModel.findByIdAndUpdate(payload.id, update, options, callback);
};

// =================
// || Search Item ||
// =================

module.exports.searchItem = (term, callback) => {
  const query = term.toString().length ? { name: term } : {};
  
  this.itemModel.find(query, callback)
  .sort({ name: 1 })
  .populate('ingredients.ingredient', 'name');
};

// =================
// || Delete Item ||
// =================

module.exports.deleteItem = (id, callback) => {
  this.itemModel.deleteOne({ _id: id }, callback);
};

module.exports.purgeIngredient = (payload, callback) => {

};

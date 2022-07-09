const mongoose = require('mongoose');

const itemIngredient = new mongoose.Schema({
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient'
  }
}, { _id: false });

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

// =================
// || Delete Item ||
// =================

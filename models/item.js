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
  ingredients: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Ingredient',
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

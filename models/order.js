const mongoose = require('mongoose');

// ================
// || Sub Schema ||
// ================

const lineItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  ingredients: {
    type: [String],
    default: []
  },
  totalCost: {
    type: String,
    required: true
  }
}, { _id: false });

const orderIngredientSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true,
  },
  ingredientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  name: {
    type: String,
    required: true
  }
}, { _id: false });

// ==================
// || Order Schema ||
// ==================

const orderSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true
  },
  orderItems: {
    type: [lineItemSchema],
    default: []
  },
  orderIngredients: {
    type: [orderIngredientSchema],
    default: []
  },
  orderTotal: {
    type: String,
    required: true
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
    required: true
  }
});

module.exports.orderModel = mongoose.model('Order', orderSchema);

// ==================
// || Create Order ||
// ==================

module.exports.createOrder = (order, callback) => {
  order.save(callback);
};

// ================
// || Edit Order ||
// ================

// ==================
// || Search Order ||
// ==================

module.exports.searchByDate = (storeId, date, callback) => {
  const query = { store: storeId, date: date };

  const importStore = {
    from: 'stores',
    pipeline: [
      { $match: { _id: storeId } },
      { $project: {
        store: {
          name: '$name',
          street: '$street',
          city: '$city',
          state: '$state',
          zip: '$zip'
        }
      } },
      { $replaceRoot: { newRoot: '$store' } }
    ],
    as: 'store'
  };

  this.orderModel.aggregate([
    { $match: query },
    { $lookup: importStore }
  ], callback);
};

module.exports.searchByDateAndStore = (date, stores, callback) => {
  const query = { date: date, store: { $in: stores } };

  const importStores = {
    from: 'stores',
    let: { storeId: '$store' },
    pipeline: [
      { $match: { $expr: { $in: ['$_id', ['$$storeId'] ] } } },
      { $project: {
        name: '$name',
        street: '$street',
        city: '$city',
        state: '$state',
        zip: '$zip'
      } }
    ],
    as: 'store'
  }

  this.orderModel.aggregate([
    { $match: query },
    { $lookup: importStores }
  ], callback);
};

// ==================
// || Delete Order ||
// ==================

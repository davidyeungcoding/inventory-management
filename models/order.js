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
  orderIngredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
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

// ======================
// || Shared Variables ||
// ======================

const importIngredient = {
  from: 'ingredients',
  localField: 'orderIngredients.orderIngredient',
  foreignField: '_id',
  as: 'orderIngredients.orderIngredient'
};

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
        store: { name: '$name', street: '$street', city: '$city', state: '$state', zip: '$zip' }
      } },
      { $replaceRoot: { newRoot: '$store' } }
    ],
    as: 'store'
  };

  // const importItem = {
  //   from: 'items',
  //   let: { itemId: '$orderItems.orderItem' },
  //   pipeline: [
  //     { $match: { $expr: { $in: ['$_id', '$$itemId'] } } },
  //     { $project: { _id: 0, orderItem: { _id: '$_id', name: '$name', ingredients: '$ingredients' } } }
  //   ],
  //   as: 'tempItems'
  // };

  this.orderModel.aggregate([
    { $match: query },
    { $lookup: importStore },
    // { $lookup: importItem },
    { $lookup: importIngredient }
  ], callback);
};

// ==================
// || Delete Order ||
// ==================

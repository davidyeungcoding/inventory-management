const mongoose = require('mongoose');

// ================
// || Sub Schema ||
// ================

const lineItemSchema = new mongoose.Schema({
  quantity: {
    type: Number,
    required: true
  },
  orderItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Item',
    required: true
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

// ==================
// || Create Order ||
// ==================

module.exports.createOrder = (order, callback) => {
  order.save(callback);
};

// ================
// || Edit Order ||
// ================



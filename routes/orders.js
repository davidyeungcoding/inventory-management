require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const auth = require('../routes-middleware/user-authorization');

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { orderModel } = require('../models/order');
const Order = require('../models/order');
const Store = require('../models/store');

// ======================
// || Shared Functions ||
// ======================

const updateStore = (order, token) => {
  try {
    Store.addOrder(order._id, order.store, (err, _store) => {
      return err ? { status: 400, msg: 'An error occured while adding order to store' }
      : { status: 201, msg: order, token: token };
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to add order to store' });
  };
};

// ==================
// || Create Order ||
// ==================

router.post('/create', auth.authenticateToken, (req, res, next) => {
  try {
    const order = new orderModel({
      weeklyOrder: req.body.weeklyOrder,
      weeklyItems: req.body.weeklyItems,
      weeklyIngredients: req.body.weeklyIngredients,
      weeklyTotal: req.body.weeklyTotal,
      store: mongoose.Types.ObjectId(req.body.store)
    });
  
    Order.createOrder(order, (err, _order) => {
      return err ? res.json({ status: 400, msg: 'An error occured while creating order' })
      : res.json(updateStore(_order, req.token));
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to create new order' });
  };
});

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
    return new Promise(resolve => {
      Store.addOrder(order._ids, order.store, (err, _store) => {
        return err ? resolve({ status: 400, msg: 'An error occured while adding order to store' })
        : resolve({ status: 201, msg: order, token: token });
      });
    })
  } catch {
    return { status: 400, msg: 'Unable to process request to add order to store' };
  };
};

// ==================
// || Create Order ||
// ==================

router.post('/create', auth.authenticateToken, (req, res, next) => {
  try {
    const order = new orderModel(req.body);

    Order.createOrder(order, async (err, _order) => {
      return err ? res.json({ status: 400, msg: 'An error occured while creating order' })
      : res.json(await updateStore(_order, req.token));
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to create new order' });
  };
});

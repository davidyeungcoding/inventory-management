require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../routes-middleware/user-authorization');

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { storeModel } = require('../models/store');
const Store = require('../models/store');
const User = require('../models/user');

// ======================
// || Shared Functions ||
// ======================

const buildResUser = user => {
  return {
    _id: user._id,
    username: user.username,
    accountType: user.accountType,
    stores: user.stores
  };
};

const updateUser = async (userId, storeId, store, token) => {
  return new Promise(resolve => {
    User.updateStores(userId, storeId, (err, _user) => {
      if (err) throw err;
      const user = buildResUser(_user);

      return _user ? resolve({ status: 200, msg: store, user: user, token: token })
      : resolve({ status: 400, msg: store, token: token });
    });
  });
};

// ==================
// || Create Store ||
// ==================

router.post('/create', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    const accountType = req.user.accountType;
    const store = new storeModel({
      name: req.body.name,
      street: req.body.street,
      city: req.body.city,
      state: req.body.state,
      zip: req.body.zip,
      users: []
    });

    if (accountType === 'manager') store.users.push(req.user._id);

    Store.createStore(store, async (err, _store) => {
      if (err) throw err;

      if (_store && accountType === 'manager') {
        const userId = req.user._id;
        const userUpdate = await updateUser(userId, _store._id, _store, req.token);
        return res.json(userUpdate);
      };

      return _store ? res.json({ status: 200, msg: _store, token: req.token })
      : res.json({ status: 400, msg: 'Unable to create new store' });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to create new store' });
  };
});

// ================
// || Edit Store ||
// ================

router.put('/edit-details', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    const payload = {};
    if (req.body.name) payload.name = req.body.name;
    if (req.body.street) payload.street = req.body.street;
    if (req.body.city) payload.city = req.body.city;
    if (req.body.state) payload.state = req.body.state;
    if (req.body.zip) payload.zip = req.body.zip;
  
    Store.editStoreDetails(req.body._id, payload, (err, _store) => {
      if (err) throw err;

      return _store ? res.json({ status: 200, msg: _store, token: req.token })
      : res.json({ status: 400, msg: 'Unable to update store details' });
    })
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to edit store details' });
  };
});

router.put('edit-users', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  return res.send('can eidt user')
});

router.put('edit-items', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  return res.send('can edit items')
});

router.put('edit-ingredients', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  return res.send('can edit ingredients')
});

// ===================
// || Search Stores ||
// ===================

// ==================
// || Delete Store ||
// ==================

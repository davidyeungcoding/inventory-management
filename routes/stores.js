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

const editStoreUsers = async (payload, token) => {
  return new Promise(resolve => {
    Store.editStoreUsers(payload, (err, _store) => {
      if (err) throw err;
  
      return _store ? resolve({ status: 200, msg: _store, token: token })
      : resolve({ status: 400, msg: 'Unable to update store\'s user list' });
    });
  });
};

const editUserStoreList = async (store, userList, action) => {
  return new Promise(resolve => {
    const storeList = [store];
    const payload = {
      userList: userList,
      storeList: storeList,
      action: action
    };

    User.editStoreList(payload, (err, _user) => {
      if (err) throw err;

      return _user ? resolve({ status: 200, msg: 'User\'s store list successfully updated' })
      : resolve({ status: 400, msg: 'Unable to update user\'s store list' });
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

router.put('/edit-users', auth.authenticateToken, auth.managerCheck, async (req, res, next) => {
  try {
    const insertion = req.body.insertion;
    const removal = req.body.removal;

    if (insertion.length) {
      const payload = {
        _id: req.body._id,
        update: insertion,
        action: 'add'
      };

      const insertionListUser = await editUserStoreList(payload._id, insertion, payload.action);
      if (insertionListUser.status !== 200) return res.json(insertionListUser);
      const insertionUpdate = await editStoreUsers(payload, req.token);
      if (insertionUpdate.status !== 200 || !removal.length) return res.json(insertionUpdate);
    };

    if (removal.length) {
      const payload = {
        _id: req.body._id,
        update: removal,
        action: 'remove'
      };

      const removalListUser = await editUserStoreList(payload._id, removal, payload.action);
      if (removalListUser.status !== 200) return res.json(removalListUser);
      const removalUpdate = await editStoreUsers(payload, req.token);
      return res.json(removalUpdate);
    };
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to update store\'s user information' });
  };
});

router.put('/edit-items', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  return res.send('can edit items')
});

router.put('/edit-ingredients', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  return res.send('can edit ingredients')
});

// ===================
// || Search Stores ||
// ===================

// ==================
// || Delete Store ||
// ==================

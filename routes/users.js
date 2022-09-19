require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const mongoose = require('mongoose');
const auth = require('../routes-middleware/user-authorization');

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { userModel } = require('../models/user');
const User = require('../models/user');
const Store = require('../models/store');

// ======================
// || Shared Functions ||
// ======================

const authUser = async username => {
  return new Promise(resolve => {
    User.authSearch(username, (err, _user) => {
      return err || !_user.length ? resolve({ status: 404, msg: 'Invalid username or password' })
      : resolve({ status: 200, msg: _user[0] });
    });
  });
};

const duplicateCheck = async username => {
  return new Promise(resolve => {
    User.authSearch(username, (err, _user) => {
      if (err) throw err;
      return _user.length ? resolve(true) : resolve(false);
    });
  });
};

const verifyPassword = async (password, hash) => {
  const match = await new Promise(resolve => {
    User.comparePassword(password, hash, (err, _match) => {
      return err ? resolve(false) : resolve(_match);
    });
  });

  return match ? { status: 200, msg: 'Password and hash match' }
  : { status: 401, msg: 'Invalid username or password' };
};

const buildResUser = user => {
  return {
    _id: user._id,
    username: user.username,
    accountType: user.accountType
  };
};

const editStoreUserList = async payload => {
  return new Promise(resolve => {
    Store.editUserListFromUser(payload, (err, _store) => {
      return err ? resolve({ status: 400, msg: 'Unable to update store\'s user list' })
      : resolve({ status: 200, msg: 'Store\'s user list uppdated' });
    });
  });
};

const editUserStoreList = async (payload, token) => {
  return new Promise(resolve => {
    User.editStoreList(payload, (err, _user) => {
      if (err || !_user) return resolve({ status: 400, msg: 'Unable to update store list for user' });
      
      const user = {
        _id: _user._id,
        username: _user.username,
        accountType: _user.accountType,
        stores: _user.stores
      };

      return resolve({ status: 200, msg: user, token: token });
    });
  });
};

const generateUpdateArray = async obj => {
  return new Promise(resolve => {
    const insertion = [];
    const removal = [];

    Object.keys(obj).forEach(key => {
      obj[key] === 'add' ? insertion.push(key) : removal.push(key);
    });

    return resolve({ insertion: insertion, removal: removal });
  });
};

// =================
// || Create User ||
// =================

router.post('/create', async (req, res, next) => {
  try {
    const duplicate = await duplicateCheck(req.body.username);
    if (duplicate) return res.json({ status: 400, msg: 'Duplicate username' });
    const payload = new userModel({
      username: req.body.username,
      password: req.body.password,
      accountType: 'general'
    });

    User.createUser(payload, (err, _user) => {
      return err ? res.json({ status: 400, msg: 'Unable to create new user' })
      : res.json({ status: 201, msg: _user });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request for new user' });
  };
});

// =======================
// || Authenticate User ||
// =======================

router.post('/login', async (req, res, next) => {
  try {
    const username = req.body.username;
    const password = req.body.password;
    const user = await authUser(username);
    if (user.status !== 200) return res.json(user);
    const match = await verifyPassword(password, user.msg.password);
    if (match.status !== 200) return res.json(match);
    const resUser = buildResUser(user.msg);
    const token = auth.generateAuthToken(resUser);
    const refreshTokenStatus = await auth.assignRefreshToken(resUser);
    if (refreshTokenStatus.status !== 200) return res.json(refreshTokenStatus);
    return res.json({ status: 200, msg: resUser, token: token });
  } catch {
    return res.json({ status: 400, msg: 'Unable to authenticate user' });
  };
});

router.get('/logout', auth.authenticateToken, (req, res, next) => {
  try {
    User.clearRefreshToken(req.user._id, (err, _user) => {
      return err ? res.json({ status: 400, msg: 'Unable to log user out' })
      : res.json({ status: 200, msg: 'User successfully logged out' });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to logout' });
  };
});

router.get('/retrieve-user', auth.authenticateToken, (req, res, next) => {
  try {
    return res.json({ status: 200, msg: req.user, token: req.token });
  } catch {
    return res.json({ status: 400, msg: 'Unable to retrieve user' });
  };
});

// ===============
// || Edit User ||
// ===============

router.put('/edit-details', auth.authenticateToken, auth.personalCheck, async (req, res, next) => {
  try {
    const password = req.body.password;
    const username = req.body.username;
    const change = {};
    if (password) change.password = password;
    
    if (username) {
      const duplicate = await duplicateCheck(username);
      if (duplicate) return res.json({ status: 400, msg: 'Duplicate username' });
      change.username = username;
    };

    User.editUser(req.body._id, change, (err, _user) => {
      if (err) return res.json({ status: 400, msg: 'Unable to update user information' });
      const resUser = buildResUser(_user);
      if (req.user._id === resUser._id) req.token = auth.generateAuthToken(resUser);
      return res.json({ status: 200, msg: resUser, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to edit user' });
  };
});

router.put('/reset-password', auth.authenticateToken, auth.personalCheck, (req, res, next) => {
  try {
    const userId = req.body._id;
    const password = crypto.randomBytes(10).toString('hex');

    User.resetPassword(userId, password, (err, _user) => {
      if (err) return res.json({ status: 400, msg: 'Unable to reset password' });
      const resUser = buildResUser(_user);
      if (req.user._id === userId) req.token = auth.generateAuthToken(resUser);
      return res.json({ status: 200, msg: password, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to rest password' });
  };
});

router.put('/change-account-type', auth.authenticateToken, auth.adminCheck, (req, res, next) => {
  try {
    const payload = {
      id: req.body._id,
      accountType: req.body.accountType
    };

    User.changeAccountType(payload, (err, _user) => {
      return err ? res.json({ status: 400, msg: 'Unable to update account type, user not found' })
      : res.json({ status: 200, msg: 'User account type successfully updated', token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to change account type' });
  };
});

router.put('/edit-stores', auth.authenticateToken, auth.managerCheck, async (req, res, next) => {
  try {
    const changes = await generateUpdateArray(req.body.toChange);
    const insertion = changes.insertion;
    const removal = changes.removal;

    if (insertion.length) {
      const payload = {
        _id: req.body._id,
        storeList: insertion,
        action: 'add'
      };

      const insertStore = await editStoreUserList(payload);
      if (insertStore.status !== 200) return res.json(insertStore);
      const insertUser = await editUserStoreList(payload, req.token);
      if (!removal.length || insertUser.status !== 200) return res.json(insertUser);
    };

    if (removal.length) {
      const payload = {
        _id: req.body._id,
        storeList: removal,
        action: 'remove'
      };

      const removeStore = await editStoreUserList(payload);
      if (removeStore.status !== 200) return res.json(removeStore);
      const removeUser = await editUserStoreList(payload, req.token);
      return res.json(removeUser);
    };

    return res.json({ status: 204, msg: 'No changes detected' });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to update stores' });
  };
});

// =================
// || Search User ||
// =================

router.get('/search', auth.authenticateToken, auth.adminCheck, (req, res, next) => {
  try {
    const term = req.query.term ? new RegExp(req.query.term, 'i') : '';
    
    User.searchUser(term, (err, _user) => {
      return err ? res.json({ status: 400, msg: 'Unable to find users matching term' })
      : res.json({ status: 200, msg: _user, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to complete search for user' });
  };
});

router.get('/full-user-list', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    User.searchUser('', (err, _list) => {
      return err ? res.json({ status: 400, msg: 'Unable to retrieve full user list' })
      : res.json({ status: 200, msg: _list, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process retrieval request for full user list' });
  };
});

router.get('/manage-user-list', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    User.manageUserSearch((err, _list) => {
      return err ? res.json({ status: 400, msg: 'Unable to retrieve full user list' })
      : res.json({ status: 200, msg: _list, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process retrieval request for full user list' });
  };
});

router.get('/store-users/:storeId', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    const storeId = mongoose.Types.ObjectId(req.params.storeId);

    User.getStoreUsers(storeId, (err, _list) => {
      return err ? res.json({ status: 400, msg: 'Unable to find users for store' })
      : res.json({ status: 200, msg: _list, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to get users for store' });
  };
});

// =================
// || Delete User ||
// =================

router.put('/delete', auth.authenticateToken, auth.adminCheck, (req, res, next) => {
  try {
    User.deleteUser(req.body.targetId, (err, _user) => {
      return err ? res.json({ status: 400, msg: 'Unable to delete user' })
      : res.json({ status: 200, msg: 'User successfully deleted', token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to delete user' });
  };
});

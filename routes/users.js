require('dotenv').config();
const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const auth = require('../routes-middleware/user-authorization');

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { userModel } = require('../models/user');
const User = require('../models/user');

// ======================
// || Shared Functions ||
// ======================

const authUser = async username => {
  return new Promise(resolve => {
    User.authSearch(username, (err, _user) => {
      if (err) throw err;

      return _user[0] ? resolve({ status: 200, msg: _user[0] })
      : resolve({ status: 404, msg: 'User not found' });
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
      if (err) throw err;
      return resolve(_match);
    });
  });

  return match ? { status: 200, msg: 'Password and hash match' }
  : { status: 401, msg: 'Invalid username or password' };
};

const buildResUser = user => {
  return {
    _id: user._id,
    username: user.username,
    accountType: user.accountType,
    stores: user.stores
  };
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
      if (err) throw err;

      return _user ? res.json({ status: 200, msg: _user })
      : res.json({ status: 400, msg: 'Unable to create new user' });
    })
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
      if (err) throw err;

      return _user ? res.json({ status: 200, msg: 'User successfully logged out' })
      : res.json({ status: 400, msg: 'Unable to log user out' });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to logout' });
  };
});

// ===============
// || Edit User ||
// ===============

router.put('/edit-user', auth.authenticateToken, auth.personalCheck, async (req, res, next) => {
  try {
    const toChange = req.body.toChange;
    const change = {};
    if (toChange.password) change.password = toChange.password;
    
    if (toChange.username) {
      const duplicate = await duplicateCheck(toChange.username);
      if (duplicate) return res.json({ status: 400, msg: 'Duplicate username' });
      change.username = toChange.username;
    };

    User.editUser(toChange._id, change, (err, _user) => {
      if (err) throw err;
      const resUser = buildResUser(_user);
      if (req.user._id === resUser._id) req.token = auth.generateAuthToken(resUser);

      return _user ? res.json({ status: 200, msg: resUser, token: req.token })
      : res.json({ status: 400, msg: 'Unable to update user information', token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to edit user' });
  };
});

router.put('/reset-password', auth.authenticateToken, auth.personalCheck, (req, res, next) => {
  try {
    const toChange = req.body.toChange;
    const password = crypto.randomBytes(10).toString('hex');

    User.resetPassword(toChange._id, password, (err, _user) => {
      if (err) throw err;
      const resUser = buildResUser(_user);
      if (req.user._id === toChange._id) req.token = auth.generateAuthToken(resUser);

      return _user ? res.json({ status: 200, msg: password, token: req.token })
      : res.json({ status: 400, msg: 'Unable to reset password', token: req.token });
    })
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to rest password' });
  };
});

router.put('/change-account-type', auth.authenticateToken, auth.adminCheck, (req, res, next) => {
  try {
    const payload = {
      id: req.body.id,
      accountType: req.body.accountType
    };

    User.changeAccountType(payload, (err, _user) => {
      if (err) throw err;

      return _user ? res.json({ status: 200, msg: 'User account type updated', token: req.token })
      : res.json({ status: 400, msg: 'Unable to update account type, user not found', token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to change account type' });
  };
});

router.put('/update-stores', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    res.send('Can update stores')
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to update stores' });
  };
});

// =================
// || Search User ||
// =================

router.get('/search', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    const term = req.query.term ? new RegExp(req.query.term, 'i') : '';
    
    User.searchUser(term, (err, _user) => {
      if (err) throw err;

      return _user ? res.json({ status: 200, msg: _user, token: req.token })
      : res.json({ status: 400, msg: 'Unable to find users matching term', token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to complete search for user' });
  };
});

// =================
// || Delete User ||
// =================

router.put('/delete', auth.authenticateToken, auth.adminCheck, (req, res, next) => {
  try {
    User.deleteUser(req.body.targetId, (err, _user) => {
      if (err) throw err;

      return _user ? res.json({ status: 200, msg: 'User successfully deleted', token: req.token })
      : res.json({ status: 400, msg: 'Unable to delete user', token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to delete user' });
  };
});

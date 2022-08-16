require('dotenv').config();
const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

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
  const user = await new Promise(resolve => {
    User.authSearch(username, (err, _user) => {
      if (err) throw err;
      return resolve(_user);
    });
  });

  return user ? { status: 200, msg: user }
  : { status: 404, msg: 'User not found' };
};

const duplicateCheck = async username => {
  return new Promise(resolve => {
    User.authSearch(username, (err, _user) => {
      if (err) throw err;
      return _user ? resolve(true) : resolve(false);
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

// ========================
// || Token Verification ||
// ========================

const generateAuthToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

const generateRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' });
};

const assignRefreshToken = async user => {
  const token = generateRefreshToken(user);

  return new Promise(resolve => {
    User.assignRefreshToken(user._id, token, (err, _token) => {
      if (err) return resolve({ status: 500, msg: 'Unable to assign refresh token' });
      return resolve({ status: 200, msg: 'Successfully added refresh token' });
    });
  });
};

const getRefreshToken = async id => {
  return new Promise(resolve => {
    User.getRefreshToken(id, (err, _user) => {
      if (err) throw err;
      return resolve(_user[0].refreshToken);
    });
  });
};

const authenticateRefreshToken = token => {
  return jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, _uesr) => {
    return err ? false : true;
  });
};

const refreshAuthToken = async tokenUser => {
  const refreshToken = await getRefreshToken(mongoose.Types.ObjectId(tokenUser._id));
  if (!refreshToken) return false;
  const validRefreshToken = authenticateRefreshToken(refreshToken);
  if (!validRefreshToken) return false;
  return generateAuthToken(buildResUser(tokenUser));
};

const authenticateToken = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    if (!token) return res.json({ status: 401, msg: 'Missing authorization credentials' });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, _user) => {
      if (err && err.name !== 'TokenExpiredError') {
        return res.json({ status: 403, msg: 'User is not authorized for access' });
      } else if (err && err.name === 'TokenExpiredError') {
        const tokenUser = jwt.decode(token);
        const resToken = await refreshAuthToken(tokenUser);
        if (!resToken) return res.json({ status: 403, msg: 'User is not authorized for access' });
        req.token = resToken;
        _user = tokenUser;
      };
      
      req.user = buildResUser(_user);
      next();
    });
  } catch {
    return res.json({ status: 400, msg: 'Missing authorization credentials' });
  };
};

// ========================
// || Account Type Check ||
// ========================

const managerCheck = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const tokenUser = jwt.decode(authHeader);
    const type = tokenUser.accountType;
    if (type !== 'manager' && type !== 'admin') return res.json({ status: 401, msg: 'User does not have manager permission' });
    next();
  } catch {
    return res.json({ status: 400, msg: 'Unable to verify account type' });
  };
};

const adminCheck = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const tokenUser = jwt.decode(authHeader);
    const type = tokenUser.accountType;
    if (type !== 'admin') return res.json({ status: 401, msg: 'User does not have admin permissions' });
    next();
  } catch {
    return res.json({ status: 400, msg: 'Unable to verify account type' });
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
    const token = generateAuthToken(resUser);
    const refreshTokenStatus = await assignRefreshToken(resUser);
    if (refreshTokenStatus.status !== 200) return res.json(refreshTokenStatus);
    return res.json({ status: 200, msg: resUser, token: token });
  } catch {
    return res.json({ status: 400, msg: 'Unable to authenticate user' });
  };
});

// ===============
// || Edit User ||
// ===============

router.put('/edit-user', authenticateToken, (req, res, next) => {
  try {
    res.send('Can edit user account')
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to edit user' });
  };
});

router.put('/change-account-type', authenticateToken, managerCheck, (req, res, next) => {
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

router.put('/update-stores', authenticateToken, managerCheck, (req, res, next) => {
  try {
    res.send('Can update stores')
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to update stores' });
  };
});

// =================
// || Search User ||
// =================

router.get('/search', authenticateToken, managerCheck, (req, res, next) => {
  try {
    res.send('Can search users')
  } catch {
    return res.json({ status: 400, msg: 'Unable to complete search for user' });
  };
});

// =================
// || Delete User ||
// =================

router.put('/delete', authenticateToken, adminCheck, (req, res, next) => {
  try {
    return res.send('Can delete account')
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to delete user' });
  };
});

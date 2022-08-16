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
    name: user.name,
    username: user.username,
    accountType: user.accountType,
    stores: user.stores
  };
};

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
      return resolve(_user.refreshToken);
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

// =================
// || Create User ||
// =================

router.post('/create', (req, res, next) => {
  try {
    const payload = new userModel({
      name: req.body.name,
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

// 

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

router.put('/test', authenticateToken, (req, res, next) => {
  res.json({ user: req.user, token: req.token })
})

require('dotenv').config();
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

// ===================
// || Model Imports ||
// ===================

const User = require('../models/user');

// ======================
// || Shared Functions ||
// ======================

const getRefreshToken = async id => {
  return new Promise(resolve => {
    User.getRefreshToken(id, (err, _user) => {
      if (err) throw err;
      return _user[0] ? resolve({ status: 200, msg: _user[0].refreshToken })
      : resolve({ status: 400, msg: 'User not found '});
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
  if (refreshToken.status !== 200) return false;
  const validRefreshToken = authenticateRefreshToken(refreshToken.msg);
  if (!validRefreshToken) return false;
  return this.generateAuthToken(buildResUser(tokenUser));
};

const buildResUser = user => {
  return {
    _id: user._id,
    username: user.username,
    accountType: user.accountType
  };
};

// ========================
// || Token Verification ||
// ========================

module.exports.generateAuthToken = user => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
};

module.exports.generateRefreshToken = user => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '3d' });
};

module.exports.assignRefreshToken = async user => {
  const token = this.generateRefreshToken(user);

  return new Promise(resolve => {
    User.assignRefreshToken(user._id, token, (err, _token) => {
      if (err) return resolve({ status: 500, msg: 'Unable to assign refresh token' });
      return resolve({ status: 200, msg: 'Successfully added refresh token' });
    });
  });
};

module.exports.authenticateToken = (req, res, next) => {
  try {
    const token = req.headers['authorization'];
    if (!token) return res.json({ status: 401, msg: 'Missing authorization credentials' });
    
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, _user) => {
      if (err && err.name !== 'TokenExpiredError') {
        return res.json({ status: 401, msg: 'User is not authorized for access' });
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

module.exports.personalCheck = (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const tokenUser = jwt.decode(authHeader);
    const toChange = req.body.toChange;
    
    if (tokenUser._id !== toChange._id && tokenUser.accountType !== 'admin') {
      return res.json({ status: 403, msg: 'User does not have permission to edit this account' });
    };

    next();
  } catch {
    return res.json({ status: 400, msg: 'Unable to verify user' });
  };
};

module.exports.managerCheck = (req, res, next) => {
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

module.exports.adminCheck = (req, res, next) => {
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

// ======================
// || No Longer in Use ||
// ======================

// const authUser = async username => {
//   return new Promise(resolve => {
//     User.authSearch(username, (err, _user) => {
//       if (err) throw err;

//       return _user[0] ? resolve({ status: 200, msg: _user[0] })
//       : resolve({ status: 404, msg: 'User not found' });
//     });
//   });
// };

// const verifyPassword = async (password, hash) => {
//   const match = await new Promise(resolve => {
//     User.comparePassword(password, hash, (err, _match) => {
//       if (err) throw err;
//       return resolve(_match);
//     });
//   });

//   return match ? { status: 200, msg: 'Password and hash match' }
//   : { status: 401, msg: 'Invalid username or password' };
// };

// module.exports.verifyCredentials = async (req, res, next) => {
//   try {
//     const credentials = req.body.credentials;
//     const user = await authUser(credentials.username);
//     if (user.status !== 200) return res.json({ status: 400, msg: 'Unable to verify user credentials' });
//     const match = await verifyPassword(credentials.password, user.msg.password);
//     if (match.status !== 200) return res.json(match);
//     req.verifiedUser = user.msg;
//     next();
//   } catch {
//     return res.json({ status: 400, msg: 'Unable to verify user credentials' });
//   };
// };

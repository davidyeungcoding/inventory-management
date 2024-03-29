const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// =================
// || User Schema ||
// =================

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['admin', 'manager', 'general'],
    required: true
  },
  stores: {
    type: [mongoose.Schema.Types.ObjectId],
    ref: 'Store',
    default: []
  },
  refreshToken: {
    type: String,
    default: ''
  }
});

module.exports.userModel = mongoose.model('User', userSchema);

// ======================
// || Shared Variables ||
// ======================

const aggregateExclusions = { password: 0, refreshToken: 0 };
const importStores = {
  from: 'stores',
  localField: 'stores',
  foreignField: '_id',
  as: 'stores'
};

// =================
// || Create User ||
// =================

module.exports.createUser = (payload, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(payload.password, salt, (err, hash) => {
      if (err) throw err;
      payload.password = hash;
      payload.save(callback);
    });
  });
};

// =======================
// || Authenticate User ||
// =======================

module.exports.authSearch = (username, callback) => {
  this.userModel.aggregate([{ $match: { username: username } }, { $project: { refreshToken: 0 } }], callback);
};

module.exports.comparePassword = (password, hash, callback) => {
  bcrypt.compare(password, hash, (err, _match) => {
    if (err) throw err;
    callback(null, _match);
  });
};

module.exports.assignRefreshToken = (id, token, callback) => {
  this.userModel.findByIdAndUpdate(id, { $set: { refreshToken: token } }, callback);
};

module.exports.getRefreshToken = (id, callback) => {
  this.userModel.aggregate([{ $match: { _id: id } }, { $project: { refreshToken: 1 } }], callback);
};

module.exports.clearRefreshToken = (id, callback) => {
  this.userModel.findByIdAndUpdate(id, { $set: { refreshToken: '' } }, callback);
};

// ===============
// || Edit User ||
// ===============

module.exports.editUser = (id, payload, callback) => {
  if (payload.password) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(payload.password, salt, (err, hash) => {
        if (err) throw err;
        payload.password = hash;
        this.userModel.findByIdAndUpdate(id, { $set: payload }, { new: true }, callback);
      });
    });
  } else {
    this.userModel.findByIdAndUpdate(id, { $set: payload }, { new: true }, callback);
  };
};

module.exports.resetPassword = (id, password, callback) => {
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(password, salt, (err, hash) => {
      if (err) throw err;
      this.userModel.findByIdAndUpdate(id, { $set: { password: hash } }, { new: true }, callback);
    });
  });
};

module.exports.changeAccountType = (payload, callback) => {
  this.userModel.findByIdAndUpdate(payload.id, { $set: { accountType: payload.accountType } }, { new: true }, callback);
};

module.exports.updateStores = (userId, storeId, callback) => {
  this.userModel.findByIdAndUpdate(userId, { $push: { stores: storeId } }, { new: true }, callback);
};

module.exports.editStoreListFromStore = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const query = { $in: payload.userList }
  const update = { [action]: { stores: payload._id } };
  this.userModel.updateMany({ _id: query }, update, callback);
};

module.exports.editStoreList = (payload, callback) => {
  const action = payload.action === 'add' ? '$push' : '$pull';
  const modifier = action === '$push' ? '$each': '$in';
  const update = { [action]: { stores: { [modifier]: payload.storeList } } };
  this.userModel.findByIdAndUpdate(payload._id, update, { new: true }, callback)
  .populate('stores', 'name');
};

// =================
// || Search User ||
// =================

module.exports.searchUser = (term, callback) => {
  const query = term.toString().length ? { username: term } : {};
  this.userModel.aggregate([{ $match: query }, { $project: aggregateExclusions }, { $lookup: importStores }], callback);
};

module.exports.manageUserSearch = callback => {
  const query = { accountType: { $nin: ['admin'] } };
  this.userModel.aggregate([{ $match: query }, { $project: aggregateExclusions }, { $lookup: importStores }], callback);
};

module.exports.getStoreUsers = (storeId, callback) => {
  const query = { stores: storeId };
  this.userModel.aggregate([{ $match: query }, { $project: aggregateExclusions }], callback);
};

// =================
// || Delete User ||
// =================

module.exports.deleteUser = (id, callback) => {
  this.userModel.deleteOne({ _id: id }, callback);
};

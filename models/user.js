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
  this.userModel.findOne({ username: username }, callback);
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

// ===============
// || Edit User ||
// ===============

module.exports.editUser = () => {}

module.exports.changeAccountType = (payload, callback) => {
  this.userModel.findByIdAndUpdate(payload.id, { $set: { accountType: payload.accountType } }, callback);
};

module.exports.updateStores = () => {}

require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { storeModel } = require('../models/store');
const Store = require('../models/store');

// ======================
// || Shared Functions ||
// ======================

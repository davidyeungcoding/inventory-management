require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = router;

// ==================
// || Model Import ||
// ==================

const { itemModel } = require('../models/item');
const Item = require('../models/item');

// =================
// || Create Item ||
// =================

router.post('/create', (req, res, next) => {
  try {
    const item = new itemModel({
      name: req.body.name
    });
  
    Item.createItem(item, (err, _item) => {
      if (err) throw err;
  
      return _item ? res.json({ status: 200, msg: _item })
      : res.json({ status: 400, msg: `Unable to creat item: ${req.body.name}` });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to create new item as requested' });
  };
});

// ===============
// || Edit Item ||
// ===============

router.put('/edit', (req, res, next) => {
  try {
    const payload = {
      id: req.body.id,
      name: req.body.name,
      ingredients: req.body.ingredients
    };

    Item.editItem(payload, (err, _item) => {
      if (err) throw err;

      return _item ? res.json({ status: 200, msg: _item })
      : res.json({ status: 400, msg: `Unable to edit item: ${payload.name} `});
    });
  } catch {
    return res.json({ status: 400, msg: "Unable to process edit request" });
  };
});

// =================
// || Search Item ||
// =================

// =================
// || Delete Item ||
// =================

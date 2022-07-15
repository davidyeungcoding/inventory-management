require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

module.exports = router;

// ==================
// || Model Import ||
// ==================

const { itemModel } = require('../models/item');
const Item = require('../models/item');

// ======================
// || Shared functions ||
// ======================

const convertToObjectId = async array => {
  return new Promise(resolve => {
    return resolve(array.map(val => val = mongoose.Types.ObjectId(val)));
  });
};

const getFoundInItems = async payload => {
  return new Promise(resolve => {
    try {
      Item.purgeSearch(payload.target, (err, _list) => {
        if (err) throw err;

        return _list ? resolve({ status: 200, msg: _list })
        : resolve({ status: 400, msg: `Unable to complete search for found items` });
      });
    } catch {
      return resolve({ status: 400, msg: 'Unable to process list of found items' });
    };
  });
};

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

router.put('/purge-ingredient', async (req, res, next) => {
  try{
    const idArray = await convertToObjectId(Object.keys(req.body.foundIn));
    const payload = {
      id: req.body.id,
      name: req.body.name,
      target: idArray
    };
    const foundInList = await getFoundInItems(payload);
    return res.json(foundInList); // continue here

    // Item.purgeIngredient(payload, (err, _items) => {
    //   if (err) throw err;

    //   return _items ? res.json({ status: 200, msg: _items })
    //   : res.json({ status: 400, msg: `Unable to purge ingredient, ${payload.name}, from all items` });
    // });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process request to purge ingredient form items' });
  };
});

// =================
// || Search Item ||
// =================

router.get('/search', (req, res, next) => {
  try {
    const term = req.query.term ? new RegExp(req.query.term, 'i') : '';

    Item.searchItem(term, req.query.type, (err, _item) => {
      if (err) throw err;

      return _item ? res.json({ status: 200, msg: _item })
      : res.json({ status: 400, msg: `Unable to find item: ${req.query.term}` });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process search request' });
  };
});

// =================
// || Delete Item ||
// =================

router.delete('/delete', (req, res, next) => {
  try {
    Item.deleteItem(req.body.id, (err, _item) => {
      if (err) throw err;

      return _item ? res.json({ status: 200, msg: `${req.body.name} has been deleted` })
      : res.json({ status: 400, msg: `Unable to delete item: ${req.body.name} `});
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process delete request' });
  };
});

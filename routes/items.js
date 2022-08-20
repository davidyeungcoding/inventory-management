require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { itemModel } = require('../models/item');
const Item = require('../models/item');
const Ingredient = require('../models/ingredient');

// ======================
// || Shared Functions ||
// ======================

const editIngredients = async payload => {
  return new Promise(resolve => {
    Item.editIngredients(payload, (err, _item) => {
      if (err) throw err;

      return _item ? resolve({ status: 200, msg: _item })
      : resolve({ status: 400, msg: `Unable to ${payload.action} ingredients` });
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

const parseIngredientArray = async arr => {
  return new Promise(resolve => {
    res = [];
    arr.forEach(val => res.push(val._id));
    return resolve(res);
  });
};

const updateFoundIn = async payload => {
  return new Promise(resolve => {
    Ingredient.updateFoundIn(payload, (err, _res) => {
      if (err) throw err;
      return resolve(_res ? { status: 200, msg: 'Ingredient updated successfully' }
      : { status: 400 });
    });
  });
};

// =================
// || Create Item ||
// =================

router.post('/create', (req, res, next) => {
  try {
    const item = new itemModel({
      name: req.body.name,
      price: req.body.price,
      active: req.body.active,
      available: req.body.available
    });
  
    Item.createItem(item, (err, _item) => {
      if (err) throw err;
      // handle adding item to store
  
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

router.put('/edit-item-details', (req, res, next) => {
  try {
    const payload = {
      id: req.body.id,
      update: req.body.update
    };

    Item.editItemDetails(payload, (err, _item) => {
      if (err) throw err;

      return _item ? res.json({ status: 200, msg: _item })
      : res.json({ status: 400, msg: `Unable to edit item: ${payload.name} `});
    });
  } catch {
    return res.json({ status: 400, msg: "Unable to process edit request" });
  };
});

router.put('/edit-item-ingredients', async (req, res, next) => {
  try {
    const changes = await generateUpdateArray(req.body.toChange);
    const insertion = changes.insertion;
    const removal = changes.removal;

    if (insertion.length) {
      const update = {
        id: req.body.id,
        ingredients: insertion,
        action: 'add'
      };
      
      const ingredientUpdate = await updateFoundIn(update);
      if (ingredientUpdate.status !== 200) return res.json({ status: ingredientUpdate.status, msg: 'Unable to add ingredients to item' });
      const additionUpdate = await editIngredients(update);
      if (additionUpdate.status !== 200 || !removal.length) return res.json(additionUpdate);
    };
    
    if (removal.length) {
      const update = {
        id: req.body.id,
        ingredients: removal,
        action: 'remove'
      };

      const ingredientUpdate = await updateFoundIn(update);
      if (ingredientUpdate.status !== 200) return res.json({ status: ingredientUpdate.status, msg: 'Unable to remove ingredients from item' });
      const removalUpdate = await editIngredients(update);
      return res.json(removalUpdate);
    };
      
    return res.json({ status: 204, msg: 'No changes detected' });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process update to ingredients' });
  };
});

// =================
// || Search Item ||
// =================

// handle search to limit with store associated with account
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

router.put('/delete', async (req, res, next) => {
  try {
    const payload = {
      id: req.body._id,
      ingredients: await parseIngredientArray(req.body.ingredients),
      action: 'remove'
    };
    const ingredientUpdate = await updateFoundIn(payload);
    if (ingredientUpdate.status !== 200) return res.json({ status: ingredientUpdate.status, msg: `Unable to delete item: ${req.body.name}` });
    // handle removal from store collection

    Item.deleteItem(req.body._id, (err, _item) => {
      if (err) throw err;

      return _item ? res.json({ status: 200, msg: `${req.body.name} has been deleted` })
      : res.json({ status: 400, msg: `Unable to delete item: ${req.body.name} `});
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process delete request' });
  };
});

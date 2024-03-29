require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../routes-middleware/user-authorization');

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { itemModel } = require('../models/item');
const Item = require('../models/item');
const Ingredient = require('../models/ingredient');
const Store = require('../models/store');

// ======================
// || Shared Functions ||
// ======================

const editIngredients = async (payload, token) => {
  return new Promise(resolve => {
    Item.editIngredients(payload, (err, _item) => {
      return err ? resolve({ status: 400, msg: `Unable to ${payload.action} ingredients` })
      : resolve({ status: 200, msg: _item, token: token });
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
    Ingredient.updateFoundInFromItem(payload, (err, _res) => {
      return err ? resolve({ status: 400 })
      : resolve({ status: 200, msg: 'Ingredient updated successfully' });
    });
  });
};

const editItemInStore = async payload => {
  return new Promise(resolve => {
    Store.editItemFromItem(payload, (err, _store) => {
      return err ? resolve({ status: 400, msg: `Unable to edit item in store` })
      : resolve({ status: 200, msg: 'Item successfully modified in store' });
    });
  });
};

// =================
// || Create Item ||
// =================

router.post('/create', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    const item = new itemModel({
      name: req.body.name,
      price: req.body.price,
      active: req.body.active,
      available: req.body.available,
      store: req.body.storeId
    });
  
    Item.createItem(item, async (err, _item) => {
      if (err) return res.json({ status: 400, msg: `Unable to creat item: ${req.body.name}` });
      const payload = {
        itemId: _item._id,
        storeId: _item.store,
        action: 'add'
      };

      const storeUpdate = await editItemInStore(payload);
      if (storeUpdate.status !== 200) return res.json(storeUpdate);
      return res.json({ status: 201, msg: _item, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to create new item as requested' });
  };
});

// ===============
// || Edit Item ||
// ===============

router.put('/edit-item-details', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    const payload = {
      id: req.body.id,
      update: req.body.update
    };

    Item.editItemDetails(payload, (err, _item) => {
      return err ? res.json({ status: 400, msg: `Unable to edit item: ${payload.name}` })
      : res.json({ status: 200, msg: _item, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: "Unable to process edit request" });
  };
});

router.put('/edit-item-ingredients', auth.authenticateToken, auth.managerCheck, async (req, res, next) => {
  try {
    const changes = await generateUpdateArray(req.body.toChange);
    const insertion = changes.insertion;
    const removal = changes.removal;

    if (insertion.length) {
      const payload = {
        itemId: req.body.id,
        ingredients: insertion,
        action: 'add'
      };
      
      const ingredientUpdate = await updateFoundIn(payload);
      if (ingredientUpdate.status !== 200) return res.json({ status: ingredientUpdate.status, msg: 'Unable to add ingredients to item' });
      const additionUpdate = await editIngredients(payload, req.token);
      if (additionUpdate.status !== 200 || !removal.length) return res.json(additionUpdate);
    };
    
    if (removal.length) {
      const payload = {
        itemId: req.body.id,
        ingredients: removal,
        action: 'remove'
      };

      const ingredientUpdate = await updateFoundIn(payload);
      if (ingredientUpdate.status !== 200) return res.json({ status: ingredientUpdate.status, msg: 'Unable to remove ingredients from item' });
      const removalUpdate = await editIngredients(payload, req.token);
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

router.get('/search/:storeId', auth.authenticateToken, (req, res, next) => {
  try {
    const term = req.query.term ? new RegExp(req.query.term, 'i') : '';
    const storeId = req.params.storeId;

    Item.searchItem(term, storeId, (err, _item) => {
      return err ? res.json({ status: 400, msg: `Unable to retrieve item data` })
      : res.json({ status: 200, msg: _item, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process search request' });
  };
});

router.get('/search-active/:storeId', auth.authenticateToken, (req, res, next) => {
  try {
    const storeId = req.params.storeId;

    Item.searchActiveItems(storeId, (err, _list) => {
      return err ? res.json({ status: 400, msg: 'Unable to retrieve active item data' })
      : res.json({ status: 200, msg: _list, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process search request for active items' });
  };
});

// =================
// || Delete Item ||
// =================

router.put('/delete', auth.authenticateToken, auth.managerCheck, async (req, res, next) => {
  try {
    const payload = {
      itemId: req.body._id,
      ingredients: await parseIngredientArray(req.body.ingredients),
      storeId: req.body.store,
      action: 'remove'
    };

    const ingredientUpdate = await updateFoundIn(payload);
    if (ingredientUpdate.status !== 200) return res.json({ status: ingredientUpdate.status, msg: `Unable to delete item: ${req.body.name}` });
    const storeUpdate = await editItemInStore(payload);
    if (storeUpdate.status !== 200) return res.json(storeUpdate);

    Item.deleteItem(payload.itemId, (err, _item) => {
      return err ? res.json({ status: 400, msg: `Unable to delete item: ${req.body.name} `})
      : res.json({ status: 200, msg: `${req.body.name} has been deleted`, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process delete request' });
  };
});

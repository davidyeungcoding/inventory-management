require('dotenv').config();
const express = require('express');
const router = express.Router();
const auth = require('../routes-middleware/user-authorization');

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { ingredientModel } = require('../models/ingredient');
const Ingredient = require('../models/ingredient');
const Item = require('../models/item');
const Store = require('../models/store');

// ======================
// || Shared Functions ||
// ======================

const purgeFromItem = async payload => {
  return new Promise(resolve => {
    Item.purgeIngredientFromIngredient(payload, (err, _res) => {
      return err ? resolve({ status: 400 })
      : resolve({ status: 200, msg: 'Updated related items' });
    });
  });
};

const editIngredientInStore = async payload => {
  return new Promise(resolve => {
    Store.editIngredientFromIngredient(payload, (err, _store) => {
      return err ? resolve({ status: 400, msg: 'Unable to edit store ingredients' })
      : resolve({ status: 200, msg: 'Successfully edited store ingredients' });
    });
  });
};

// =======================
// || Create Ingredient ||
// =======================

router.post('/create', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try {
    const ingredient = new ingredientModel({
      name: req.body.name,
      store: req.body.storeId
    });
  
    Ingredient.createIngredient(ingredient, async (err, _ingredient) => {
      if (err) return res.json({ status: 400, msg: `Failed to create new ingredient: ${ingredient.name}` });
      const payload = {
        ingredientId: _ingredient._id,
        storeId: _ingredient.store,
        action: 'add'
      };

      const storeUpdate = await editIngredientInStore(payload);
      if (storeUpdate.status !== 200) return res.json(storeUpdate);
      return res.json({ status: 201, msg: _ingredient, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to create new ingredient as requested' });
  };
});

// =====================
// || Edit Ingredient ||
// =====================

router.put('/edit', auth.authenticateToken, auth.managerCheck, (req, res, next) => {
  try { 
    const payload = {
      _id: req.body._id,
      update: req.body.update
    };
  
    Ingredient.editIngredient(payload, (err, _ingredient) => {
      return err ? res.json({ status: 400, msg: `Unable to update ${payload.name}` })
      : res.json({ status: 200, msg: _ingredient, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to update ingredient as requested' });
  };
});

// ========================
// || Search Ingredients ||
// ========================

router.get('/search/:storeId', auth.authenticateToken, (req, res, next) => {
  try {
    const payload = {
      term: req.query.term ? new RegExp(req.query.term, 'i') : '',
      storeId: req.params.storeId
    };

    Ingredient.searchIngredient(payload, (err, _list) => {
      return err ? res.json({ status: 400, msg: `Unable to search for term: \"${term}\"` })
      : res.json({ status: 200, msg: _list, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process search request' });
  };
});

// =======================
// || Delete Ingredient ||
// =======================

router.put('/delete', auth.authenticateToken, auth.managerCheck, async (req, res, next) => {
  try {
    const payload = {
      target: req.body.foundIn,
      ingredientId: req.body._id,
      storeId: req.body.store,
      action: 'remove'
    };

    const itemUpdate = await purgeFromItem(payload);
    if (itemUpdate.status !== 200) return res.json({ status: itemUpdate.status, msg: `Unable to delete ${req.body.name} from associated items` });
    const storeUpdate = await editIngredientInStore(payload);
    if (storeUpdate.status !== 200) return res.json(storeUpdate);

    Ingredient.deleteIngredient(req.body._id, (err, _ingredient) => {
      return err ? res.json({ status: 400, msg: `Unable to delete ${req.body.name}` })
      : res.json({ status: 200, msg: `${req.body.name} has been deleted`, token: req.token });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to delete ingredient as requested' });
  };
});

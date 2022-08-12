require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { ingredientModel } = require('../models/ingredient');
const Ingredient = require('../models/ingredient');
const Item = require('../models/item');

// ======================
// || Shared Functions ||
// ======================

const processIngredientList = async list => {
  const temp = list.map(ingredient => {
    return ingredient = ingredient._id;
  });
  
  return new Promise(resolve => resolve(temp));
};

const purgeFromItem = async payload => {
  return new Promise(resolve => {
    Item.purgeIngredient(payload, (err, _res) => {
      if (err) throw err;
      return resolve(_res ? { status: 200, msg: 'Updated related items' }
      : { status: 400 });
    });
  });
};

// =======================
// || Create Ingredient ||
// =======================

router.post('/create', (req, res, next) => {
  try {
    const ingredient = new ingredientModel({
      name: req.body.name
    });
  
    Ingredient.createIngredient(ingredient, (err, _ingredient) => {
      if (err) throw err;
  
      return _ingredient ? res.json({ status: 200, msg: _ingredient })
      : res.json({ status: 400, msg: `Failed to create new ingredient: ${ingredient.name}` });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to create new ingredient as requested' });
  };
});

// =====================
// || Edit Ingredient ||
// =====================

router.put('/edit', (req, res, next) => {
  try {
    const update = {};
    if (req.body.name) update.name = req.body.name;
    if (req.body.foundIn) update.foundIn = req.body.foundIn;
    if (!Object.keys(update).length) return res.json({ status: 400, msg: 'No changes detected' });
    
    const payload = {
      id: req.body.id,
      update: update
    };
  
    Ingredient.editIngredient(payload, (err, _ingredient) => {
      if (err) throw err;
  
      return _ingredient ? res.json({ status: 200, msg: _ingredient })
      : res.json({ status: 400, msg: `Unable to update ${payload.name}` });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to update ingredient as requested' });
  };
});

router.put('/purge-item', async (req, res, next) => {
  try {
    const payload = {
      item: req.body._id,
      ingredients: await processIngredientList(req.body.ingredients)
    };

    Ingredient.purgeItem(payload, (err, _res) => {
      if (err) throw err;

      return _res ? res.json({ status: 200, msg: `${req.body.name} has been purged from ingredients` })
      : res.json({ status: 400, msg: 'Unable to process request to purge item from ingredients' });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to purge item from ingredients' });
  };
});

// ========================
// || Search Ingredients ||
// ========================

router.get('/search', (req, res, next) => {
  try {
    const payload = {
      term: req.query.term ? new RegExp(req.query.term, 'i') : '',
      type: req.query.type ? req.query.type : ''
    };

    Ingredient.searchIngredient(payload, (err, _list) => {
      if (err) throw err;

      return _list ? res.json({ status: 200, msg: _list })
      : res.json({ status: 400, msg: `Unable to search for term: \"${term}\"` });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to process search request' });
  };
});

router.get('/found-in', (req, res, next) => {
  try {
    Ingredient.searchForDeletion(req.query.id, (err, _foundIn) => {
      if (err) throw err;

      return _foundIn ? res.json({ status: 200, msg: _foundIn })
      : res.json({ status: 400, msg: `Unable to perform search for: ${req.query.name}` })
    });
  } catch {
    return res.json({ status: 400, msg: 'Could not perform found-in verification search' });
  };
});

// =======================
// || Delete Ingredient ||
// =======================

router.put('/delete', async (req, res, next) => {
  try {
    const payload = {
      target: req.body.foundIn,
      id: req.body._id
    };
    const itemUpdate = await purgeFromItem(payload);
    if (itemUpdate.status !== 200) return res.json({ status: itemUpdate.status, msg: `Unable to delete ${req.body.name} from associated items` });

    Ingredient.deleteIngredient(req.body._id, (err, _ingredient) => {
      if (err) throw err;

      return _ingredient ? res.json({ status: 200, msg: `${req.body.name} has been deleted` })
      : res.json({ status: 400, msg: `Unable to delete ${req.body.name}` });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to delete ingredient as requested' });
  };
});

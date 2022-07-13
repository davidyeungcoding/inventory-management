require('dotenv').config();
const express = require('express');
const router = express.Router();

module.exports = router;

// ===================
// || Model Imports ||
// ===================

const { ingredientModel } = require('../models/ingredient');
const Ingredient = require('../models/ingredient');

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
  
    Ingredient.editIngredient(req.body.id, update, (err, _ingredient) => {
      if (err) throw err;
  
      return _ingredient ? res.json({ status: 200, msg: _ingredient })
      : res.json({ status: 400, msg: `Unable to update ${payload.name}` });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to update ingredient as requested' });
  };
});

// ========================
// || Search Ingredients ||
// ========================

router.get('/search', (req, res, next) => {
  try {
    const payload = {
      term: req.query.term ? new RegExp(req.query.term, 'i') : '',
      type: req.query.type
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

router.delete('/delete', (req, res, next) => {
  try {
    // insert functionality for purging ingredient from items that include it as an ingredient
      // pull virtual of items where ingredient is found
        // if found, return with popup asking user to confirm purge and deletion
          // if user confirms redirect to different delete request to purge and delete
        // if not found, continue with ingredient deletion

    Ingredient.deleteIngredient(req.body._id, (err, _ingredient) => {
      if (err) throw err;
      console.log(_ingredient);

      return _ingredient ? res.json({ status: 200, msg: `${req.body.name} has been deleted` })
      : res.json({ status: 400, msg: `Unable to delete ${req.body.name}` });
    });
  } catch {
    return res.json({ status: 400, msg: 'Unable to delete ingredient as requested' });
  };
})

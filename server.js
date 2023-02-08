require('dotenv').config();
const express = require('express');
const path = require('path');
const bodyparser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const port = process.env.PORT || 3000;

// ===================
// || DB Connection ||
// ===================

mongoose.connect(process.env.DATABASE, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

mongoose.connection.on('error', err => {
  console.log(`Database Error: ${err}`);
});

// ================
// || Middleware ||
// ================

app.use(cors());
// app.use(express.static(path.join(__dirname, 'src'))); // dev
app.use(express.static(path.join(__dirname, '/dist/inventory-management', 'index.html'))); // production
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: false
}));

// =======================
// || DB Request Routes ||
// =======================

const ingredients = require('./routes/ingredients');
const items = require('./routes/items');
const users = require('./routes/users');
const stores = require('./routes/stores');
const orders = require('./routes/orders');

app.use('/ingredients', ingredients);
app.use('/items', items);
app.use('/users', users);
app.use('/stores', stores);
app.use('/orders', orders);

app.get('/*', (req, res, next) => {
  res.sendFile(path.join(__dirname, '/dist/inventory-management', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

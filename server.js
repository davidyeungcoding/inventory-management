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
  useUnifiedTopology: true,
  // useFindAndModify: false
});

mongoose.connection.on('error', err => {
  console.log(`Database Error: ${err}`);
});

// ================
// || Middleware ||
// ================

app.use(cors());
app.use(express.static(path.join(__dirname, 'src')));
app.use(bodyparser.json());
app.use(bodyparser.urlencoded({
  extended: false
}));

// =======================
// || DB Request Routes ||
// =======================

const ingredients = require('./routes/ingredients');

app.use('/ingredients', ingredients);

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

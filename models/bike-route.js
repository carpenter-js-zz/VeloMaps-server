'use strict';

const mongoose = require('mongoose');

const routeSchema = new mongoose.Schema({
  name: {type: String, required: true},
  description: String,
  path: {type: Array, required: true}
});

routeSchema.set('timestamps', true);

routeSchema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  }
});

module.exports = mongoose.model('Route', routeSchema);
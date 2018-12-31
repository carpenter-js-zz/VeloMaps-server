'use strict';

const express = require('express');
const mongoose = require('mongoose');

const BikeRoute = require('../models/bike-route');

const router = express.Router();

router.get('/', (req, res, next) => {
  BikeRoute.find()
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
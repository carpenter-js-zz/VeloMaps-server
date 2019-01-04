'use strict';

const express = require('express');
const mongoose = require('mongoose');

const BikeRoute = require('../models/bike-route');

const router = express.Router();

// get all
router.get('/', (req, res, next) => {
  BikeRoute.find()
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

// get by id - later

// post
router.post('/', (req, res, next) => {
  const { name, description, path } = req.body;

  // validate
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }
	
  if (!path) {
    const err = new Error('Missing `path` in request body');
    err.status = 400;
    return next(err);
  }

  const newBikeRoute = { name, description, path };

  BikeRoute.create(newBikeRoute)
    .then(result => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
    });
});

module.exports = router;
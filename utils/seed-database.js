'use strict';
// ---drop/seed db in CL---> node utils/seed-database.js

const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');

const BikeRoute = require('../models/bike-route');
const { routes } = require('../db/data');

console.log(`Connecting to mongodb at ${MONGODB_URI}`);
mongoose.connect(MONGODB_URI, { useNewUrlParser: true })
  .then(() => {
    console.info('Delete Data');
    return Promise.all([
      BikeRoute.deleteMany(),
    ]);
  })
  .then(() => {
    console.info('Seeding Database');
    return Promise.all([
      BikeRoute.insertMany(routes)   
    ]);
  })
  .then(results => {
    console.log('Inserted', results);
    console.info('Disconnecting');
    return mongoose.disconnect();
  })
  .catch(err => {
    console.error(err);
    return mongoose.disconnect();
  });
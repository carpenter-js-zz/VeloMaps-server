'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db-mongoose');
// const {dbConnect} = require('./db-knex');

const app = express();

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: (req, res) => process.env.NODE_ENV === 'test'
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN
  })
);

app.get('/api/routes', (req, res, next) => {
  res.json([
    {lat: 39.753761766463, lng: -104.99863849925396},
    {lat: 39.750396366621935, lng: -104.99413238810894},
    {lat: 39.746601846089845, lng: -104.9990247373521},
    {lat: 39.745967232716154, lng: -104.99799138551589},
    {lat: 39.74309643014503, lng: -105.00193959718581}
  ]);
  next();
});

function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
